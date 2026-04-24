import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../infrastructure/database/database.module';
import * as schema from '../infrastructure/persistence/index';
import { R2Service } from '../infrastructure/r2/r2.service';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly r2: R2Service,
  ) {}

  async uploadFile(
    userId: number,
    file: Express.Multer.File,
    purpose: 'profile_picture' | 'cac_document' | 'drivers_license' | 'other',
  ) {
    if (!file) {
      throw new BadRequestException({ message: 'No file provided.', success: false });
    }

    const ext = file.originalname.split('.').pop();
    const key = `${userId}/${purpose}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await this.r2.exposeR2Credentials().send(
      new PutObjectCommand({
        Bucket: this.r2.getBucketName(),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicDomain = this.r2.getPublicDomain();
    const file_url = `${publicDomain}/${key}`;

    const [saved] = await this.db
      .insert(schema.files)
      .values({
        user_id: userId,
        file_key: key,
        file_url,
        file_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
        purpose,
      })
      .returning();

    return {
      message: 'File uploaded successfully.',
      data: saved,
      success: true,
    };
  }

  async deleteFile(userId: number, fileId: number) {
    const [file] = await this.db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, fileId));

    if (!file) {
      throw new NotFoundException({ message: 'File not found.', success: false });
    }
    if (file.user_id !== userId) {
      throw new ForbiddenException({ message: 'You do not own this file.', success: false });
    }

    await this.r2.exposeR2Credentials().send(
      new DeleteObjectCommand({
        Bucket: this.r2.getBucketName(),
        Key: file.file_key,
      }),
    );

    await this.db.delete(schema.files).where(eq(schema.files.id, fileId));

    return { message: 'File deleted successfully.', success: true };
  }
}
