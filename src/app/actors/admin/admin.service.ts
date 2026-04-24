import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.module';
import * as schema from 'src/infrastructure/persistence/index';
import { InvitationsService } from 'src/invitations/invitations.service';
import { JwtPayload } from 'src/interfaces/users/jwt.type';
import { RoleNameType } from 'src/interfaces/users/roles.type';
import { AdminInviteDto } from './dto/invite.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly invitationsService: InvitationsService,
  ) {}

  async invite(currentUser: JwtPayload, dto: AdminInviteDto) {
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
