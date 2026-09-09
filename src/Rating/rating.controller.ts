import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Redirect,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './DTOs/create.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/role.decorator';

@Controller('rating')
@UseGuards(RolesGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 1. Dashboard User (Form & List Penilaian Pribadi)
  @Get()
  @Render('user-dashboard') // Otomatis render Handlebars
  async getUserDashboard(@CurrentUser() user: any) {
    const listPenilaian = await this.ratingService.findByUserId(user.sub);

    // Kirim data langsung ke template Handlebars (bukan JSON)
    return {
      title: 'Dashboard Penilaian',
      user,
      listPenilaian,
    };
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
