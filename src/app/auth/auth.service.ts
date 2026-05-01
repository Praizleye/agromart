import * as crypto from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { and, desc, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { accessJwtConfig } from './config/access-jwt';
import { refreshJwtConfig } from './config/refresh-jwt';
import { CompleteInviteDto } from './dto/complete-invite.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.module';
import * as schema from 'src/infrastructure/persistence/index';
import type { JwtPayload } from 'src/interfaces/users/jwt.type';
import { PROTECTED_ROLES } from 'src/interfaces/users/roles.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(accessJwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof accessJwtConfig>,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtCfg: ConfigType<typeof refreshJwtConfig>,
  ) {}

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async findByEmail(email: string) {
    return (
      (
        await this.db
          .select()
          .from(schema.users)
          .where(eq(sql`lower(${schema.users.email})`, email.toLowerCase()))
      )[0] ?? null
    );
  }

  private async findByPhone(phone: string, countryCode: string) {
    return (
      (
        await this.db
          .select()
          .from(schema.users)
          .where(
            and(
              eq(schema.users.phone, phone),
              eq(schema.users.country_code, countryCode),
            ),
          )
      )[0] ?? null
    );
  }

  private async generateJwtTokens(user: {
    id: number;
    email: string;
    role: string;
  }) {
    const accessTtl = this.jwtCfg.signOptions?.expiresIn ?? '15m';
    const refreshTtl = this.refreshJwtCfg.expiresIn ?? '7d';

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as any,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: accessTtl,
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.refreshJwtCfg.secret,
      expiresIn: refreshTtl,
    });

    await this.db
      .update(schema.users)
      .set({ refresh_token })
      .where(eq(schema.users.id, user.id));

    return { access_token, refresh_token };
  }

  private async generateAndSaveOTP(userId: number) {
    const token = this.generateOTP();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await this.db
      .delete(schema.email_verification)
      .where(eq(schema.email_verification.user_id, userId));

    await this.db.insert(schema.email_verification).values({
      user_id: userId,
      token,
      expires_at,
    });

    return token;
  }

  async register(dto: RegisterDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      if (!existing.is_email_verified) {
        throw new BadRequestException({
          message:
            'Account exists but email is not verified. Check your inbox.',
          success: false,
        });
      }
      throw new BadRequestException({
        message: 'An account with this email already exists.',
        success: false,
      });
    }

    if (dto.phone && dto.country_code) {
      const phoneExists = await this.findByPhone(dto.phone, dto.country_code);
      if (phoneExists) {
        throw new BadRequestException({
          message: 'An account with this phone number already exists.',
          success: false,
        });
      }
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const [user] = await this.db
      .insert(schema.users)
      .values({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        country_code: dto.country_code,
        password: hashedPassword,
        role: 'user',
        is_email_verified: false,
      })
      .returning();

    const token = await this.generateAndSaveOTP(user.id);

    this.eventEmitter.emit('user.verification', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
    });

    return {
      message:
        'Registration successful! Please check your email for the verification code.',
      data: { email: user.email },
      success: true,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException({
        message: 'User not found.',
        success: false,
      });
    }
    if (user.is_email_verified) {
      throw new BadRequestException({
        message: 'Email is already verified.',
        success: false,
      });
    }

    const [tokenRecord] = await this.db
      .select()
      .from(schema.email_verification)
      .where(eq(schema.email_verification.user_id, user.id))
      .orderBy(desc(schema.email_verification.created_at))
      .limit(1);

    if (!tokenRecord || tokenRecord.token !== dto.token) {
      throw new BadRequestException({
        message: 'Invalid verification code.',
        success: false,
      });
    }
    if (tokenRecord.expires_at && new Date() > tokenRecord.expires_at) {
      throw new BadRequestException({
        message: 'Verification code has expired.',
        success: false,
      });
    }

    await this.db
      .update(schema.users)
      .set({ is_email_verified: true })
      .where(eq(schema.users.id, user.id));

    await this.db
      .delete(schema.email_verification)
      .where(eq(schema.email_verification.user_id, user.id));

    const tokens = await this.generateJwtTokens(user);

    this.eventEmitter.emit('user.welcome', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    });

    return {
      message: 'Email verified successfully.',
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      success: true,
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      return {
        message:
          'If this email exists and is unverified, a new code has been sent.',
        success: true,
      };
    }
    if (user.is_email_verified) {
      throw new BadRequestException({
        message: 'Email is already verified.',
        success: false,
      });
    }

    const token = await this.generateAndSaveOTP(user.id);

    this.eventEmitter.emit('user.verification', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
    });

    return {
      message: 'A new verification code has been sent to your email.',
      success: true,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid credentials.',
        success: false,
      });
    }
    if (!user.is_email_verified) {
      throw new BadRequestException({
        message: 'Please verify your email before logging in.',
        success: false,
      });
    }
    if (!user.is_active) {
      throw new ForbiddenException({
        message: 'Your account has been deactivated.',
        success: false,
      });
    }
    if (!user.password) {
      throw new BadRequestException({
        message: 'This account uses invite-based login.',
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        message: 'Invalid credentials.',
        success: false,
      });
    }

    const tokens = await this.generateJwtTokens(user);

    return {
      message: 'Login successful.',
      data: {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
      success: true,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      return {
        message: 'If this email exists, a reset code has been sent.',
        success: true,
      };
    }

    const token = this.generateOTP();

    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.password_resets)
        .where(eq(schema.password_resets.user_id, user.id));
      await tx.insert(schema.password_resets).values({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      });
    });

    this.eventEmitter.emit('user.forgot-password', {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      token,
    });

    return {
      message: 'If this email exists, a reset code has been sent.',
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid request.',
        success: false,
      });
    }

    const [resetRecord] = await this.db
      .select()
      .from(schema.password_resets)
      .where(eq(schema.password_resets.user_id, user.id))
      .orderBy(desc(schema.password_resets.created_at))
      .limit(1);

    if (!resetRecord || resetRecord.token !== dto.token) {
      throw new BadRequestException({
        message: 'Invalid reset code.',
        success: false,
      });
    }
    if (resetRecord.expires_at && new Date() > resetRecord.expires_at) {
      throw new BadRequestException({
        message: 'Reset code has expired.',
        success: false,
      });
    }

    const hashedPassword = await this.hashPassword(dto.new_password);

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.id, user.id));
      await tx
        .delete(schema.password_resets)
        .where(eq(schema.password_resets.user_id, user.id));
    });

    return { message: 'Password reset successfully.', success: true };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        { secret: this.refreshJwtCfg.secret },
      );

      const [user] = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.sub));

      if (!user || user.refresh_token !== refreshToken) {
        throw new BadRequestException({
          message: 'Invalid refresh token.',
          success: false,
        });
      }

      const tokens = await this.generateJwtTokens(user);

      return {
        message: 'Tokens refreshed successfully.',
        data: tokens,
        success: true,
      };
    } catch {
      throw new BadRequestException({
        message: 'Invalid or expired refresh token.',
        success: false,
      });
    }
  }

  async completeInvite(dto: CompleteInviteDto) {
    const [invite] = await this.db
      .select()
      .from(schema.invitations)
      .where(
        and(
          eq(schema.invitations.token, dto.token),
          eq(schema.invitations.status, 'pending'),
        ),
      );

    if (!invite) {
      throw new BadRequestException({
        message: 'Invalid or already used invitation.',
        success: false,
      });
    }
    if (new Date() > invite.expires_at) {
      await this.db
        .update(schema.invitations)
        .set({ status: 'expired' })
        .where(eq(schema.invitations.id, invite.id));
      throw new BadRequestException({
        message: 'This invitation has expired.',
        success: false,
      });
    }

    const existing = await this.findByEmail(invite.email);
    if (existing) {
      throw new BadRequestException({
        message: 'This email is already registered.',
        success: false,
      });
    }

    if (dto.phone && dto.country_code) {
      const phoneExists = await this.findByPhone(dto.phone, dto.country_code);
      if (phoneExists) {
        throw new BadRequestException({
          message: 'An account with this phone number already exists.',
          success: false,
        });
      }
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const newUser = await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: invite.email.toLowerCase(),
          phone: dto.phone,
          country_code: dto.country_code,
          password: hashedPassword,
          role: invite.role,
          is_email_verified: true,
          invited_by: invite.invited_by,
        })
        .returning();

      await tx
        .update(schema.invitations)
        .set({ status: 'accepted' })
        .where(eq(schema.invitations.id, invite.id));

      return user;
    });

    const tokens = await this.generateJwtTokens(newUser);

    this.eventEmitter.emit('user.welcome', {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    });

    return {
      message: 'Registration completed successfully.',
      data: {
        ...tokens,
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
        },
      },
      success: true,
    };
  }

  async getMe(userId: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      throw new NotFoundException({
        message: 'User not found.',
        success: false,
      });
    }

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
      data: {
        ...safeUser,
        profile: { ...profile, profile_picture: profilePicture },
      },
      success: true,
    };
  }
}
