import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatingModule } from './Rating/rating.module';
import { RatingEntity } from './Rating/entity/rating.entity';
import { RolesGuard } from './guards/roles.guard';
import { UserMiddleware } from './middleware/user.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '192.182.6.203',
      port: parseInt(process.env.DB_PORT!, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'CGIT@IT25',
      database: process.env.DB_NAME || 'db_purchasing',
      entities: [RatingEntity],
      synchronize: true, // Otomatis sync tabel MySQL saat app start
    }),
    RatingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Jalankan UserMiddleware di semua rute agar req.user terisi SEBELUM RolesGuard dipanggil
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
