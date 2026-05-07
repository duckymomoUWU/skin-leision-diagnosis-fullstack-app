import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PatientController } from './patient.controller';
import { User } from './entities/user.entity';
import { PatientProfile } from './entities/patient-profile.entity';
import { DoctorProfile } from './entities/doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PatientProfile, DoctorProfile])],
  controllers: [UsersController, PatientController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
