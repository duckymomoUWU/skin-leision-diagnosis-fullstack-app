import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(UserRole.PATIENT)
  @Post()
  create(@Request() req, @Body() createOrderDto: any) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Roles(UserRole.PATIENT)
  @Get('my')
  findMy(@Request() req) {
    return this.orderService.findMy(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(+id, status);
  }
}