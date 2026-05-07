import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skin_lesions')
export class SkinLesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  full_name: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  symptoms: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  recommendation: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  danger_level: string;

  @Column({ type: 'number', default: 0 })
  is_deleted: number;
}
