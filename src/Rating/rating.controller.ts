import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Redirect,
  UseGuards,
  BadRequestException,
  Req,
  Res,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './DTOs/create.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import * as express from 'express';
import { Request, Response } from 'express';

@Controller('rating')
@UseGuards(RolesGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 1. Dashboard User (Form & List Penilaian Pribadi)
  @Get()
  // Hapus @Render('user-dashboard') di sini agar tidak bentrok dengan res.render() / res.json()
  async getUserDashboard(
    @CurrentUser() user: any,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const listPenilaian = await this.ratingService.findByUserId(user.sub);

    // Ambil header 'accept' via helper method express atau req.headers['accept']
    const acceptHeader = req.get('accept') || req.headers['accept'] || '';
    const acceptsHtml =
      typeof acceptHeader === 'string' && acceptHeader.includes('text/html');

    if (acceptsHtml) {
      return res.render('user-dashboard', {
        title: 'Dashboard Penilaian',
        user,
        listPenilaian,
      });
    }

    // Return JSON jika dipanggil via API/Fetch
    return res.json({
      berhasil: true,
      user,
      listPenilaian,
    });
  }

  // 2. Action Create Penilaian
  @Post('create')
  @Roles('staff', 'leaders', 'vice leader', 'cashgampang') // Guard khusus multi-group
  @Redirect('/rating')
  async createPenilaian(
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    // Normalisasi array items dari form (support multipart/form-data & URL-encoded)
    if (typeof dto.items === 'string') {
      try {
        dto.items = JSON.parse(dto.items);
      } catch (e) {
        throw new BadRequestException('Format items tidak valid');
      }
    }

    await this.ratingService.create(dto, user);
  }

  // 3. Dashboard Atasan (Review All Penilaian)
  @Get('review')
  @Roles('atasan', 'admin') // Role terpusat dari Authentik via Kong
  @Render('atasan-dashboard')
  async getAtasanReview(@CurrentUser() user: any) {
    const allPenilaian = this.ratingService.findAll();
    return {
      user,
      allPenilaian,
    };
  }
}
