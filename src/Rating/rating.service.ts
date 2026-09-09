import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { RatingEntity } from './entity/rating.entity';
import { CreateRatingDto } from './DTOs/create.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepo: Repository<RatingEntity>,
  ) {}

  // 1. Action Create dengan QR Code TTD Digital
  async create(dto: CreateRatingDto, user: any): Promise<RatingEntity> {
    const userName = user.preferred_username || user.name || 'User';
    const userDivisi = user.divisi || user.department || 'General';

    // Temporary ID untuk payload QR sebelum persist
    const tempId = `PEN-${Date.now()}`;

    // Payload yang di-encode ke QR Code sebagai TTD Digital
    const qrPayload = JSON.stringify({
      penilaian_id: tempId,
      signed_by: userName,
      user_id: user.sub,
      divisi: userDivisi,
      signed_at: new Date().toISOString(),
    });

    const qrTtdBase64 = await QRCode.toDataURL(qrPayload);

    // Instansiasi entity
    const newRating = this.ratingRepo.create({
      ...dto,
      user_id: user.sub,
      nama_user: userName,
      divisi: userDivisi,
      qr_ttd: qrTtdBase64,
    });

    return await this.ratingRepo.save(newRating);
  }

  // 2. Fetch khusus Dashboard Review (Berdasarkan Matrix RBAC & Divisi)
  async findForReview(user: any): Promise<RatingEntity[]> {
    const userGroups: string[] = user.groups || [];
    const userDivisi: string = user.divisi || user.department || '';

    // ATURAN 1: Secretary / Director -> BISA LIHAT SEMUA DATA
    const isGlobalViewer = userGroups.some((group) =>
      ['secretary', 'director', 'authentik Admins'].includes(group),
    );

    if (isGlobalViewer) {
      return await this.ratingRepo.find({
        order: { created_at: 'DESC' },
      });
    }

    // ATURAN 2A: Leader / Vice Leader -> LIHAT SEMUA DATA DI DIVISI YANG SAMA
    const isLeaderOrVice = userGroups.some((group) =>
      ['leaders', 'vice leader'].includes(group),
    );

    if (isLeaderOrVice) {
      return await this.ratingRepo.find({
        where: { divisi: userDivisi },
        order: { created_at: 'DESC' },
      });
    }

    // ATURAN 2B: User / Staff Biasa -> HANYA LIHAT FORM CIPTAANNYA SENDIRI
    return await this.ratingRepo.find({
      where: { user_id: user.sub },
      order: { created_at: 'DESC' },
    });
  }

  // 3. Fetch Riwayat Pribadi User
  async findByUserId(userId: string): Promise<RatingEntity[]> {
    return await this.ratingRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
