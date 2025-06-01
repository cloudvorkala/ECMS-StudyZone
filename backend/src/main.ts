import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    console.log('Starting server initialization...');
    console.log('Reading SSL certificates...');

    const certPath = path.join(__dirname, '../certificates/certificate.crt');
    const keyPath = path.join(__dirname, '../certificates/private.key');

    console.log('Certificate path:', certPath);
    console.log('Key path:', keyPath);

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      throw new Error('SSL certificates not found!');
    }

    const httpsOptions: HttpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    console.log('Creating NestJS application with HTTPS...');
    const app = await NestFactory.create(AppModule, {
      httpsOptions,
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
      cors: {
        origin: ['https://localhost:3000', 'https://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const configService = app.get(ConfigService);

    console.log('Configuring session middleware...');
    app.use(
      session({
        secret: configService.get<string>('SESSION_SECRET') || 'super-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: true,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 2,
        },
      }),
    );

    console.log('Setting up global guards and pipes...');
    const jwtAuthGuard = app.get(JwtAuthGuard);
    app.useGlobalGuards(jwtAuthGuard);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    console.log('Setting up Swagger documentation...');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Mentor Match API')
      .setDescription('The Mentor Match API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('port', 3000);

    console.log('Starting server...');
    await app.listen(port);
    console.log('=================================');
    console.log(`Server is running on: https://localhost:${port}`);
    console.log(`Swagger docs: https://localhost:${port}/api/docs`);
    console.log('=================================');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}
bootstrap();
