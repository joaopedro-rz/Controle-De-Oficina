import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o frontend acessar a API
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('ELLP API')
    .setDescription('API de gerenciamento de voluntários e workshops')
    .setVersion('1.0')
    // Se você estiver usando JWT
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // nome da segurança
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Inicializa o app
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
  console.log(`🚀 API rodando em http://localhost:${process.env.PORT || 3001}`);
  console.log(
    `📖 Swagger disponível em http://localhost:${process.env.PORT || 3001}/api/docs`,
  );
}

void bootstrap();
