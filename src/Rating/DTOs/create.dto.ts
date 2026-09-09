export class CreateRatingDto {
  tgl_spp: string;
  tgl_masuk: string;
  jangka_waktu: number;
  nama_purchasing: string;
  items: ItemRatingDto[];
}

export class ItemRatingDto {
  nama_barang: string;
  nilai_kecepatan: number;
  nilai_kualitas: number;
}
