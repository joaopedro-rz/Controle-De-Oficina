import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilita CORS para o frontend acessar a API
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  await app.listen(Number(process.env.PORT) || 3001);
}

void bootstrap();
