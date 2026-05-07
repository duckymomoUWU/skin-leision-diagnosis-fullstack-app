import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Roles(UserRole.PATIENT)
  @Post()
  create(@Request() req, @Body() createDto: any) {
    return this.appointmentService.create(req.user.id, createDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  @Get('my')
  findMy(@Request() req) {
    return this.appointmentService.findMy(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentService.update(+id, { status });
  }

  @Roles(UserRole.DOCTOR)
  @Patch(':id/result')
  updateResult(@Param('id') id: string, @Body('doctor_result') doctor_result: string) {
    return this.appointmentService.update(+id, { doctor_result, status: 'COMPLETED' });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}
