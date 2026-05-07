import { Controller, Get, Patch, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PatientProfile } from './entities/patient-profile.entity';

@Controller('patient')
export class PatientController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PatientProfile)
    private readonly patientProfileRepository: Repository<PatientProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id), role: UserRole.PATIENT },
      relations: ['patientProfile'],
    });

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    // Map to match frontend expected structure
    return {
      id: user.id,
      _id: user.id, // for legacy frontend compatibility
      email: user.email,
      fullName: user.patientProfile?.full_name || '',
      phone: user.patientProfile?.phone || '',
      address: user.patientProfile?.address || '',
      gender: user.patientProfile?.gender || '',
      dob: user.patientProfile?.birth_date || '',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id), role: UserRole.PATIENT },
    });

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    // Update profile
    await this.patientProfileRepository.update(
      { user_id: user.id },
      {
        full_name: updateData.fullName,
        phone: updateData.phone,
        address: updateData.address,
        gender: updateData.gender,
        birth_date: updateData.dob,
      },
    );

    return { message: 'Profile updated successfully' };
  }
}
