import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkinLesionService } from './skin-leision.service';
import { SkinLesionController } from './skin-leision.controller';
import { SkinLesion } from './entities/skin-leision.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkinLesion])],
  controllers: [SkinLesionController],
  providers: [SkinLesionService],
  exports: [SkinLesionService],
})
export class SkinLesionModule {}
