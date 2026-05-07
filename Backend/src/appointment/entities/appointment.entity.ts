import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patient_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ nullable: true })
  doctor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ type: 'varchar', length: 30, nullable: true })
  scheduled_date: string;

  @Column({ type: 'varchar', length: 15, default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  patient_notes: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  doctor_result: string;

  @Column({ type: 'number', default: 0 })
  is_deleted: number;

  @CreateDateColumn()
  created_at: Date;
}
