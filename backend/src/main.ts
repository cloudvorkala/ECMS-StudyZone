import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // add session middleware
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'super-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // support both frontend and mentor registration
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mentor Match API')
    .setDescription('The Mentor Match API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
