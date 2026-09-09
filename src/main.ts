import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use((req: any, res: any, next: any) => {
    const userInfoHeader = req.headers['x-userinfo'];
    if (userInfoHeader) {
      try {
        let rawJson = userInfoHeader;
        if (
          typeof userInfoHeader === 'string' &&
          !userInfoHeader.startsWith('{')
        ) {
          rawJson = Buffer.from(userInfoHeader, 'base64').toString('utf-8');
        }
        req.user = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      } catch (e) {
        req.user = null;
      }
    }
    next();
  });

  // Setup Templating Engine Handlebars
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
