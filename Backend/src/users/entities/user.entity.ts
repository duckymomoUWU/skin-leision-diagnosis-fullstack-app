import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';
import { DoctorProfile } from './doctor-profile.entity';

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refresh_token: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => PatientProfile, (profile) => profile.user, { cascade: true, eager: true })
  patientProfile?: PatientProfile;

  @OneToOne(() => DoctorProfile, (profile) => profile.user, { cascade: true, eager: true })
  doctorProfile?: DoctorProfile;
}
