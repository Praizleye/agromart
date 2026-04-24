import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../infrastructure/database/database.module';
import * as schema from '../../infrastructure/persistence/index';
import { InvitationsService } from '../../invitations/invitations.service';
import { JwtPayload } from '../../interfaces/users/jwt.type';
import { RoleNameType } from '../../interfaces/users/roles.type';
import { SuperAdminInviteDto } from './dto/invite.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly invitationsService: InvitationsService,
  ) {}

  async invite(currentUser: JwtPayload, dto: SuperAdminInviteDto) {
    return this.invitationsService.sendInvite(
      currentUser.sub,
      currentUser.role,
      dto,
    );
  }

  async listByRole(role: RoleNameType) {
    const users = await this.db
      .select({
        id: schema.users.id,
        first_name: schema.users.first_name,
        last_name: schema.users.last_name,
        email: schema.users.email,
        phone: schema.users.phone,
        role: schema.users.role,
        is_active: schema.users.is_active,
        is_email_verified: schema.users.is_email_verified,
        created_at: schema.users.created_at,
      })
      .from(schema.users)
      .where(eq(schema.users.role, role as any));

    return {
      message: `${role} list fetched successfully.`,
      data: users,
      success: true,
    };
  }
}
