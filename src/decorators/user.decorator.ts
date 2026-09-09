import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userInfoHeader = request.headers['x-userinfo'];

    if (userInfoHeader) {
      try {
        let rawJson = userInfoHeader;

        // Decode jika Kong mengirim Base64 string
        if (
          typeof userInfoHeader === 'string' &&
          !userInfoHeader.startsWith('{')
        ) {
          rawJson = Buffer.from(userInfoHeader, 'base64').toString('utf-8');
        }

        const parsed =
          typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

        // Attach ke request.user agar bisa dibaca RolesGuard
        request.user = parsed;

        return parsed;
      } catch (e) {
        return null;
      }
    }

    return null;
  },
);
