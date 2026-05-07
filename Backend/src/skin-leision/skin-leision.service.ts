import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinLesion } from './entities/skin-leision.entity';

@Injectable()
export class SkinLesionService {
  constructor(
    @InjectRepository(SkinLesion)
    private readonly skinLesionRepository: Repository<SkinLesion>,
  ) {}

  async create(createSkinLesionDto: Partial<SkinLesion>): Promise<SkinLesion> {
    const skinLesion = this.skinLesionRepository.create(createSkinLesionDto);
    return this.skinLesionRepository.save(skinLesion);
  }

  async createMany(createSkinLesionDtos: any[]): Promise<SkinLesion[]> {
    const skinLesions = this.skinLesionRepository.create(createSkinLesionDtos);
    return this.skinLesionRepository.save(skinLesions);
  }

  async findAll(): Promise<SkinLesion[]> {
    return this.skinLesionRepository.find({ where: { is_deleted: 0 } });
  }

  async findOne(id: number): Promise<SkinLesion> {
    const lesion = await this.skinLesionRepository.findOne({ where: { id, is_deleted: 0 } });
    if (!lesion) {
      throw new NotFoundException(`Skin Lesion with ID ${id} not found`);
    }
    return lesion;
  }

  async findByName(name: string): Promise<SkinLesion> {
    const lesion = await this.skinLesionRepository.findOne({ 
      where: { name: name.toUpperCase(), is_deleted: 0 } 
    });
    if (!lesion) {
      throw new NotFoundException(`Skin Lesion with name ${name} not found`);
    }
    return lesion;
  }

  async update(id: number, updateSkinLesionDto: any): Promise<SkinLesion> {
    await this.skinLesionRepository.update(id, updateSkinLesionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.skinLesionRepository.update(id, { is_deleted: 1 });
  }
}
