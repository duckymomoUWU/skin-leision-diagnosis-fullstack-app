import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('diagnoses')
export class Diagnose {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ type: 'varchar', length: 20, nullable: true })
  prediction: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  confidence: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string;

  @Column({ type: 'number', default: 0 })
  is_deleted: number;

  @CreateDateColumn()
  created_at: Date;
}