import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('doctors')
  async findAllDoctors() {
    const doctors = await this.userRepository.find({
      where: { role: UserRole.DOCTOR },
      relations: ['doctorProfile'],
    });

    return doctors.map(doc => ({
      id: doc.id,
      email: doc.email,
      fullName: doc.doctorProfile?.full_name || 'Dr. Unknown',
      avatar: doc.doctorProfile?.avatar_url || null,
      discipline: doc.doctorProfile?.discipline || 'Dermatologist',
    }));
  }
}
