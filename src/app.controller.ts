import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './decorators/user.decorator';

@Controller()
export class AppController {
  @Get('test-authentik') // Sesuai dengan Route Path di Kong
  getAuthTest(@CurrentUser() userName: string) {
    return {
      berhasil: true,
      message: `user from auth: ${userName}`,
    };
  }
}
