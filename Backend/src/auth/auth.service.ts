import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import ms from 'ms';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User, response: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(refreshExpiration || '7d'),
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(user: User, response: any) {
    await this.usersService.updateRefreshToken(user.id, null);
    response.clearCookie('refresh_token');
    return { success: true };
  }

  async refreshToken(refreshToken: string, response: any) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user, response);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
