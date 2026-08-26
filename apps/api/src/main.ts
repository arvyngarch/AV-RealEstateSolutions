import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { auth } from 'express-oauth2-jwt-bearer';
import { AppModule } from './app.module';

function requiredAuth0Value(name: 'AUTH0_DOMAIN' | 'AUTH0_AUDIENCE'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required when AUTH0_ENABLED=true`);
  }
  return value;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  if (process.env.AUTH0_ENABLED === 'true') {
    const domain = requiredAuth0Value('AUTH0_DOMAIN');
    app.use(
      auth({
        issuerBaseURL: `https://${domain}`,
        audience: requiredAuth0Value('AUTH0_AUDIENCE'),
      }),
    );
  }

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
