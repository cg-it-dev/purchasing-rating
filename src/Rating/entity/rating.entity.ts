import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ItemRatingDto } from '../DTOs/create.dto';

@Entity('penilaian')
export class RatingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  nama_user: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  divisi: string;

  @Column({ type: 'varchar', length: 255 })
  nama_purchasing: string;

  @Column({ type: 'date' })
  tgl_spp: string;

  @Column({ type: 'date' })
  tgl_masuk: string;

  @Column({ type: 'int' })
  jangka_waktu: number;

  @Column({ type: 'json' })
  items: ItemRatingDto[];

  @Column({ type: 'text', nullable: true })
  qr_ttd: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
