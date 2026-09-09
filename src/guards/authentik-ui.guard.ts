import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthentikUiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Ambil token/session (bisa dari cookie, header, atau X-User-Payload dari Kong)
    const user = request.user || request.headers['x-user-payload'];

    if (!user) {
      // Redirect langsung ke URL Login Authentik kamu
      const authentikLoginUrl =
        'http://192.182.6.203:9000/application/o/authorize/?client_id=6bRWzSiPrzX5OVobJh6hpm4Ih9nYALxtmq7a67pJ';
      response.redirect(authentikLoginUrl);
      return false;
    }

    return true;
  }
}
