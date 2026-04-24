import * as multer from 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { uploadSchema } from './dto/upload.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CustomResponseInterceptor } from '../interceptors/api-response.interceptor';
import { ZodValidationPipe } from '../infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from '../interfaces/users/jwt.type';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

@Controller('uploads')
@UseGuards(AuthGuard)
@UseInterceptors(CustomResponseInterceptor)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Unsupported file type. Allowed: JPEG, PNG, WebP, PDF.',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(uploadSchema)) dto: any,
  ) {
    return this.uploadsService.uploadFile(user.sub, file, dto.purpose);
  }

  @Delete(':id')
  deleteFile(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.uploadsService.deleteFile(user.sub, id);
  }
}
