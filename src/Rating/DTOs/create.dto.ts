import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ItemRatingDto {
  @IsString()
  @IsNotEmpty()
  nama_barang: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  nilai_kecepatan: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  nilai_kualitas: number;
}

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  tgl_spp: string;

  @IsString()
  @IsNotEmpty()
  tgl_masuk: string;

  @IsNumber()
  @Type(() => Number)
  jangka_waktu: number;

  @IsString()
  @IsNotEmpty()
  nama_purchasing: string;

  // Handle parsing jika items dikirim sebagai Stringified JSON dari HTML Form
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRatingDto)
  items: ItemRatingDto[];
}
