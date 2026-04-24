import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../infrastructure/database/database.module';
import * as schema from '../../infrastructure/persistence/index';
import { UpdateUserProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getProfile(userId: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) throw new NotFoundException({ message: 'User not found.', success: false });

    let [profile] = await this.db
      .select()
      .from(schema.extended_profiles)
      .where(eq(schema.extended_profiles.user_id, userId));

    if (!profile) {
      [profile] = await this.db
        .insert(schema.extended_profiles)
        .values({ user_id: userId })
        .returning();
    }

    let profilePicture: Record<string, unknown> | null = null;
    if (profile.profile_picture_id) {
      [profilePicture] = await this.db
        .select()
        .from(schema.files)
        .where(eq(schema.files.id, profile.profile_picture_id));
    }

    const { password, refresh_token, ...safeUser } = user;
    return {
      message: 'Profile fetched successfully.',
      data: { ...safeUser, profile: { ...profile, profile_picture: profilePicture } },
      success: true,
    };
  }

  async updateProfile(userId: number, dto: UpdateUserProfileDto) {
    const [existing] = await this.db
      .select()
      .from(schema.extended_profiles)
      .where(eq(schema.extended_profiles.user_id, userId));

    const currentMeta = (existing?.metadata ?? {}) as Record<string, any>;
    const { profile_picture_id, phone, country_code, ...metaFields } = dto;

    const updatedMeta = { ...currentMeta, ...metaFields };

    if (phone !== undefined || country_code !== undefined) {
      await this.db
        .update(schema.users)
        .set({
          ...(phone !== undefined && { phone }),
          ...(country_code !== undefined && { country_code }),
        })
        .where(eq(schema.users.id, userId));
    }

    const [profile] = await this.db
      .insert(schema.extended_profiles)
      .values({
        user_id: userId,
        profile_picture_id: profile_picture_id ?? null,
        metadata: updatedMeta,
      })
      .onConflictDoUpdate({
        target: schema.extended_profiles.user_id,
        set: {
          ...(profile_picture_id !== undefined && { profile_picture_id }),
          metadata: updatedMeta,
          updated_at: new Date(),
        },
      })
      .returning();

    return {
      message: 'Profile updated successfully.',
      data: profile,
      success: true,
    };
  }
}
