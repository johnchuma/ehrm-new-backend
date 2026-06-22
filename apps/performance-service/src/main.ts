import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '../../../libs/common/src/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['ehrm.performance', 'ehrm.common'],
      protoPath: [
        join(__dirname, '..', '..', '..', 'proto', 'performance.proto'),
        join(__dirname, '..', '..', '..', 'proto', 'common.proto'),
      ],
      url: '0.0.0.0:5007',
    },
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
  console.log('Performance Service is running on port 5007');
}
bootstrap();
