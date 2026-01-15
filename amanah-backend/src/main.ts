import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dns from 'node:dns';
import helmet from 'helmet';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  
  // For standard deployment
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Amanah backend is running on: http://localhost:${port}/api`);
  }
  
  await app.init();
  return app.getHttpAdapter().getInstance();
}

// Export the express server for Vercel
export default bootstrap();

