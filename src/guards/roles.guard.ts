import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika route/controller tidak dipasang decorator @Roles(), loloskan (bebas diakses)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Diset oleh UserInterceptor atau hasil decode X-Userinfo

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    // Authentik mengirim groups/roles dalam bentuk Array atau Object
    const userRoles: string[] = Array.isArray(user.groups)
      ? user.groups
      : typeof user.groups === 'object' && user.groups !== null
        ? Object.values(user.groups)
        : [];

    // Cek apakah user punya minimal 1 role yang sesuai dengan requiredRoles
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke halaman/endpoint ini',
      );
    }

    return true;
  }
}
