import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQProducer } from './rabbitmq.producer';
import { RabbitMQConsumer } from './rabbitmq.consumer';

@Module({
	providers: [RabbitMQService, RabbitMQProducer, RabbitMQConsumer],
	exports: [RabbitMQProducer, RabbitMQConsumer],
})
export class RabbitMQModule {}
