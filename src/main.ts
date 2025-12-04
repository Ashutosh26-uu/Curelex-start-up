import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Healthcare Telemedicine API')
    .setDescription('API for Healthcare Telemedicine Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log('\n🚀 Healthcare Telemedicine Platform Started!');
  console.log('==========================================');
  console.log(`📡 Backend API: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log('==========================================');
  console.log('\n📋 Login Credentials:');
  console.log('👨💼 Admin: ashutosh@curelex.com / admin@123');
  console.log('👨⚕️ Doctor: doctor@healthcare.com / doctor123');
  console.log('👤 Patient: patient@healthcare.com / patient123');
  console.log('==========================================\n');
}
bootstrap();