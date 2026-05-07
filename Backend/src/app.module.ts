import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { PatientProfile } from './users/entities/patient-profile.entity';
import { DoctorProfile } from './users/entities/doctor-profile.entity';
import { SkinLesionModule } from './skin-leision/skin-leision.module';
import { DiagnoseModule } from './diagnose/diagnose.module';
import { AppointmentModule } from './appointment/appointment.module';
import { SkinLesion } from './skin-leision/entities/skin-leision.entity';
import { Diagnose } from './diagnose/entities/diagnose.entity';
import { Appointment } from './appointment/entities/appointment.entity';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { Product } from './product/entities/product.entity';
import { Order } from './order/entities/order.entity';
import { OrderDetail } from './order_detail/entities/order_detail.entity';
import { UploadModule } from './cloudinary/upload.module';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('ORACLE_HOST') || 'localhost',
        port: configService.get<number>('ORACLE_PORT') || 1521,
        username: configService.get<string>('ORACLE_USER'),
        password: configService.get<string>('ORACLE_PASSWORD'),
        serviceName: configService.get<string>('ORACLE_SERVICE_NAME') || 'FREEPDB1',
        entities: [User, PatientProfile, DoctorProfile, SkinLesion, Diagnose, Appointment, Product, Order, OrderDetail],
        synchronize: true, // For development only!
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    SkinLesionModule,
    DiagnoseModule,
    AppointmentModule,
    ProductModule,
    OrderModule,
    UploadModule, // <-- CloudinaryModule
  ],  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
