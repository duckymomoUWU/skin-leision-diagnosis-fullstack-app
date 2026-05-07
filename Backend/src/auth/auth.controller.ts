import { Controller, Post, Body, UseGuards, Get, Req, Res, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response, Request as ExpressRequest } from 'express';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12);
      const userParams = {
        email: body.email,
        password: hashedPassword,
        role: body.role || UserRole.PATIENT,
      };
      
      const profileParams = {
        full_name: body.fullName || body.full_name,
        phone: body.phone,
        address: body.address,
      };

      const user = await this.usersService.create(userParams, profileParams);
      const { password, refresh_token, ...result } = user;
      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(req.user, response);
  }

  @Get('refresh')
  async refresh(@Req() request: ExpressRequest, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.refreshToken(token, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (user) {
      delete user.password;
      delete user.refresh_token;
    }
    return user;
  }
}
