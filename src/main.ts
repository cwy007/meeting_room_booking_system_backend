import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { UnLoginFilter } from './unlogin.filter';
import { CustomExceptionFilter } from './custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  app.useGlobalFilters(new UnLoginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: '基于 JWT 的鉴权',
      name: 'Authorization',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [MeetingRoomModule],
  });
  SwaggerModule.setup('api-doc', app, document);

  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>('nest_server_port') ?? 3000);
}
bootstrap();
