import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { PatientProfile } from './entities/patient-profile.entity';
import { DoctorProfile } from './entities/doctor-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PatientProfile)
    private readonly patientProfileRepository: Repository<PatientProfile>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfileRepository: Repository<DoctorProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userParams: Partial<User>, profileParams: Partial<PatientProfile | DoctorProfile>): Promise<User> {
    const existing = await this.findByEmail(userParams.email!);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // Save User first
    const user = this.userRepository.create(userParams);
    const savedUser = await this.userRepository.save(user);

    // Save Profile
    if (savedUser.role === UserRole.PATIENT) {
      const profile = this.patientProfileRepository.create({
        ...profileParams,
        user_id: savedUser.id,
      });
      await this.patientProfileRepository.save(profile);
      savedUser.patientProfile = profile;
    } else if (savedUser.role === UserRole.DOCTOR) {
      const profile = this.doctorProfileRepository.create({
        ...profileParams,
        user_id: savedUser.id,
      });
      await this.doctorProfileRepository.save(profile);
      savedUser.doctorProfile = profile;
    }

    return savedUser;
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, { refresh_token: refreshToken });
  }
}
