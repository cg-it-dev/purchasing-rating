import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Kong mengirim header X-Userinfo (Express mengubah key header ke lowercase)
    const userInfoHeader = req.headers['x-userinfo'];

    if (userInfoHeader) {
      try {
        const rawHeader = Array.isArray(userInfoHeader)
          ? userInfoHeader[0]
          : userInfoHeader;

        let decodedPayload = '';

        // 1. Coba decode URI Component jika Kong meng-encode khusus karakter URL
        const unescapedHeader = decodeURIComponent(rawHeader);

        // 2. Cek apakah berupa JSON string polos atau Base64
        if (unescapedHeader.trim().startsWith('{')) {
          decodedPayload = unescapedHeader;
        } else {
          // Decode dari Base64 ke UTF-8 String
          decodedPayload = Buffer.from(unescapedHeader, 'base64').toString(
            'utf-8',
          );
        }

        // 3. Set ke req.user
        (req as any).user = JSON.parse(decodedPayload);
      } catch (error) {
        // Fallback jika parsing gagal (misal header corrupt/malformed)
        (req as any).user = null;
      }
    }

    next();
  }
}
