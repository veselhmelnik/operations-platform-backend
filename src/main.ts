import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('TaskFlow backend API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');
}
bootstrap();
