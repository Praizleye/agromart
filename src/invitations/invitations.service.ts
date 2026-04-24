import * as crypto from 'crypto';
import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../infrastructure/database/database.module';
import * as schema from '../infrastructure/persistence/index';
import {
  ADMIN_INVITABLE,
  RoleNameType,
  SUPER_ADMIN_INVITABLE,
} from '../interfaces/users/roles.type';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async sendInvite(
    inviterId: number,
    inviterRole: RoleNameType,
    dto: { email: string; role: RoleNameType },
  ) {
    const allowedRoles =
      inviterRole === RoleNameType.SuperAdmin
        ? SUPER_ADMIN_INVITABLE
        : ADMIN_INVITABLE;

    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException({
        message: `You cannot invite someone with the role '${dto.role}'.`,
        success: false,
      });
    }

    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(sql`lower(${schema.users.email})`, dto.email.toLowerCase()));

    if (existingUser) {
      throw new BadRequestException({
        message: 'A user with this email already exists.',
        success: false,
      });
    }

    const [pendingInvite] = await this.db
      .select()
      .from(schema.invitations)
      .where(
        and(
          eq(sql`lower(${schema.invitations.email})`, dto.email.toLowerCase()),
          eq(schema.invitations.status, 'pending'),
        ),
      );

    if (pendingInvite) {
      throw new BadRequestException({
        message: 'A pending invitation has already been sent to this email.',
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const [invite] = await this.db
      .insert(schema.invitations)
      .values({
        email: dto.email.toLowerCase(),
        role: dto.role,
        token,
        invited_by: inviterId,
        expires_at,
      })
      .returning();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;

    this.eventEmitter.emit('user.invite', {
      email: dto.email,
      role: dto.role,
      inviteLink,
    });

    return {
      message: `Invitation sent to ${dto.email}.`,
      data: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at,
      },
      success: true,
    };
  }
}
