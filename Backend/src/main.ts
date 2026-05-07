import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  const envOrigins = configService
    .get<string>('CORS_ORIGINS')
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set<string>([
    'http://localhost:5173',
    'http://localhost:8000',
    'https://duckymomouwu.github.io',
    ...(envOrigins ?? []),
  ]);

  // Enable CORS for frontend
  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server calls or tools without Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useStaticAssets(join(__dirname, '..', 'public')); //js css, images, etc.
  app.setBaseViewsDir(join(__dirname, '..', 'view')); //view
  app.setViewEngine('ejs');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ properties không có decorator
      forbidNonWhitelisted: true, // Throw error nếu có property không được cho phép
      transform: true, // Tự động transform types
      transformOptions: {
        enableImplicitConversion: true, // Convert string to number tự động
      },
    }),
  );

  const port = configService.get('PORT') || 8000;
  await app.listen(port);
  console.log(`🚀 Backend server running on port ${port}`);
}
bootstrap();
