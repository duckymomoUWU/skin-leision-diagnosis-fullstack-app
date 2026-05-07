import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SkinLesionService } from './skin-leision.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('skin-leision')
export class SkinLesionController {
  constructor(private readonly skinLesionService: SkinLesionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSkinLesionDto: any) {
    return this.skinLesionService.create(createSkinLesionDto);
  }

  @Get()
  findAll() {
    return this.skinLesionService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk')
  async createMany(@Body() createSkinLesionDtos: any[]) {
    return this.skinLesionService.createMany(createSkinLesionDtos);
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string) {
    return this.skinLesionService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skinLesionService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSkinLesionDto: any,
  ) {
    return this.skinLesionService.update(+id, updateSkinLesionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skinLesionService.remove(+id);
  }
}
