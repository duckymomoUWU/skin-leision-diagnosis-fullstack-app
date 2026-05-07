import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.doctorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  full_name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @Column({ length: 100, nullable: true })
  discipline: string;

  @Column({ type: 'numeric', precision: 3, nullable: true })
  experience_yrs: number;

  @Column({ type: 'numeric', precision: 2, scale: 1, nullable: true })
  rating: number;
  
  @Column({ type: 'varchar', length: 1000, nullable: true })
  bio: string;
}
