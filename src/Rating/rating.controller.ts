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

@Controller('rating')
@UseGuards(RolesGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 1. Dashboard User (Form & List Penilaian Pribadi)
  @Get()
  async getUserDashboard(
    @CurrentUser() user: any,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const listPenilaian = await this.ratingService.findByUserId(user.sub);

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

    return res.json({
      berhasil: true,
      user,
      listPenilaian,
    });
  }

  // 2. Action Create Penilaian
  @Post('create')
  @Roles(
    'staff',
    'leaders',
    'vice leader',
    'secretary',
    'director',
    'cashgampang',
    'purchasing',
  )
  @Redirect('/rating')
  async createPenilaian(
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    if (typeof dto.items === 'string') {
      try {
        dto.items = JSON.parse(dto.items);
      } catch (e) {
        throw new BadRequestException('Format items tidak valid');
      }
    }

    await this.ratingService.create(dto, user);
  }

  // 3. Dashboard Review Penilaian (Filter Dynamic via Service)
  @Get('review')
  @Roles(
    'staff',
    'leaders',
    'vice leader',
    'secretary',
    'director',
    'cashgampang',
    'purchasing',
  )
  @Render('atasan-dashboard')
  async getAtasanReview(@CurrentUser() user: any) {
    // Matriks akses (Secretary/Director -> ALL, Leader/Vice -> Same Divisi, Staff -> Own Data)
    const allPenilaian = await this.ratingService.findForReview(user);

    return {
      user,
      allPenilaian,
    };
  }
}
