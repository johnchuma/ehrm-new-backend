import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '../../../libs/common/src/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['ehrm.assets', 'ehrm.common'],
      protoPath: [
        join(__dirname, '..', '..', '..', 'proto', 'assets.proto'),
        join(__dirname, '..', '..', '..', 'proto', 'common.proto'),
      ],
      url: '0.0.0.0:5013',
    },
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
  console.log('Assets Service is running on port 5013');
}
bootstrap();
