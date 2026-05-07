import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DiagnoseService } from './diagnose.service';
import { DiagnoseController } from './diagnose.controller';
import { Diagnose } from './entities/diagnose.entity';
import { UploadModule } from '../cloudinary/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diagnose]),
    HttpModule,
    UploadModule
  ],
  controllers: [DiagnoseController],
  providers: [DiagnoseService],
  exports: [DiagnoseService],
})
export class DiagnoseModule {}
