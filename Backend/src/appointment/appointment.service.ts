import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(patientId: number, createAppointmentDto: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      patient_id: patientId,
    });
    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { is_deleted: 0 },
      relations: ['patient', 'doctor'],
    });
  }

  async findMy(userId: number, role: string): Promise<Appointment[]> {
    const whereCondition: any = { is_deleted: 0 };
    if (role === 'PATIENT') {
      whereCondition.patient_id = userId;
    } else if (role === 'DOCTOR') {
      whereCondition.doctor_id = userId;
    }
    
    return this.appointmentRepository.find({
      where: whereCondition,
      relations: ['patient', 'doctor'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, is_deleted: 0 },
      relations: ['patient', 'doctor'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: number, updateData: any): Promise<Appointment> {
    await this.appointmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.appointmentRepository.update(id, { is_deleted: 1 });
  }
}
