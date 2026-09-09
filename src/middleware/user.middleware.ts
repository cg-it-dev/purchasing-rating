import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userInfoHeader =
      req.headers['x-userinfo'] || req.headers['x-authentik-meta-user'];

    if (userInfoHeader) {
      try {
        // Handle jika header berupa Base64 JSON atau JSON String biasa
        const rawString =
          typeof userInfoHeader === 'string'
            ? userInfoHeader
            : userInfoHeader[0];

        // Parse JSON (atau buffer decode jika base64)
        const parsedUser = JSON.parse(
          rawString.startsWith('{')
            ? rawString
            : Buffer.from(rawString, 'base64').toString('utf-8'),
        );

        // Map data ke req.user
        (req as any).user = parsedUser;
      } catch (e) {
        (req as any).user = null;
      }
    }

    next();
  }
}
