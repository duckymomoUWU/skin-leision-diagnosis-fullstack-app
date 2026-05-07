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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DiagnoseService } from './diagnose.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('diagnose')
export class DiagnoseController {
  constructor(private readonly diagnoseService: DiagnoseService) {}

  @Roles(UserRole.PATIENT)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
  ) {
    return this.diagnoseService.create(req.user.id, file, description);
  }

  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Get()
  findAll() {
    return this.diagnoseService.findAll();
  }

  @Roles(UserRole.PATIENT)
  @Get('my-history')
  findMyHistory(@Request() req) {
    return this.diagnoseService.findByPatient(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnoseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiagnoseDto: any) {
    return this.diagnoseService.update(+id, updateDiagnoseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnoseService.remove(+id);
  }
}
