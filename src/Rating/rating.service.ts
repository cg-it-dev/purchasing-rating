import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { CreateRatingDto } from './DTOs/create.dto';

export interface PenilaianRecord extends CreateRatingDto {
  id: string;
  user_id: string;
  nama_user: string;
  qr_ttd: string;
  created_at: string;
}

@Injectable()
export class RatingService {
  private dbPenilaian: PenilaianRecord[] = [];

  async create(dto: CreateRatingDto, user: any): Promise<PenilaianRecord> {
    const id = `PEN-${Date.now()}`;
    const userName = user.preferred_username || user.name || 'User';

    // Payload yang di-encode ke QR Code sebagai TTD Digital
    const qrPayload = JSON.stringify({
      penilaian_id: id,
      signed_by: userName,
      user_id: user.sub,
      signed_at: new Date().toISOString(),
    });

    const qrTtdBase64 = await QRCode.toDataURL(qrPayload);

    const record: PenilaianRecord = {
      id,
      ...dto,
      user_id: user.sub,
      nama_user: userName,
      qr_ttd: qrTtdBase64,
      created_at: new Date().toLocaleDateString('id-ID'),
    };

    this.dbPenilaian.push(record);
    return record;
  }

  findByUserId(userId: string): PenilaianRecord[] {
    return this.dbPenilaian.filter((item) => item.user_id === userId);
  }

  findAll(): PenilaianRecord[] {
    return this.dbPenilaian;
  }
}
