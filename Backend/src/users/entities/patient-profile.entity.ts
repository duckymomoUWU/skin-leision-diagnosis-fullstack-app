import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.patientProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  full_name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birth_date: Date;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 300, nullable: true })
  address: string;
}
