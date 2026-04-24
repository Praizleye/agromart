import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
