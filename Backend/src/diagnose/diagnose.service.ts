import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnose } from './entities/diagnose.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class DiagnoseService {
  constructor(
    @InjectRepository(Diagnose)
    private readonly diagnoseRepository: Repository<Diagnose>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(patientId: number, file: Express.Multer.File, description?: string): Promise<Diagnose> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    try {
      // 1. Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      const imageUrl = uploadResult.secure_url;

      // 2. Call FastAPI for prediction
      const aiServiceUrl = this.configService.get('AI_SERVICE_URL') || 'http://localhost:8001';
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const aiResponse = await firstValueFrom(
        this.httpService.post(`${aiServiceUrl}/predict`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );

      const { prediction, confidence } = aiResponse.data;

      // 3. Save to DB
      const diagnose = this.diagnoseRepository.create({
        patient_id: patientId,
        image_url: imageUrl,
        prediction: prediction,
        confidence: confidence,
        description: description || '',
      });

      return this.diagnoseRepository.save(diagnose);
    } catch (error) {
      console.error('Error during diagnosis process:', error);
      throw new BadRequestException('Failed to process diagnosis. Ensure AI server is running.');
    }
  }

  async findAll(): Promise<Diagnose[]> {
    return this.diagnoseRepository.find({
      where: { is_deleted: 0 },
      relations: ['patient'],
      order: { created_at: 'DESC' }
    });
  }

  async findByPatient(patientId: number): Promise<Diagnose[]> {
    return this.diagnoseRepository.find({
      where: { patient_id: patientId, is_deleted: 0 },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Diagnose> {
    const diagnose = await this.diagnoseRepository.findOne({
      where: { id, is_deleted: 0 },
      relations: ['patient'],
    });
    if (!diagnose) {
      throw new NotFoundException(`Diagnose with ID ${id} not found`);
    }
    return diagnose;
  }

  async update(id: number, updateDiagnoseDto: Partial<Diagnose>): Promise<Diagnose> {
    await this.diagnoseRepository.update(id, updateDiagnoseDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.diagnoseRepository.update(id, { is_deleted: 1 });
  }
}
