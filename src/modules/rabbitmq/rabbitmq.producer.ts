import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { MessagePayload } from '../../common/interfaces/message.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQProducer {
	constructor(
		private rabbitMQService: RabbitMQService,
		private configService: ConfigService,
	) {}

	async sendMessage(message: MessagePayload): Promise<boolean> {
		try {
			const channel = await this.rabbitMQService.getChannel();
			const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE') || 'vvikon_exchange';
			const routingKey = this.configService.get<string>('RABBITMQ_ROUTING_KEY') || 'messages';

			const result = channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
				persistent: true,
			});

			if (result) {
				console.log(`Message sent to RabbitMQ for user ${message.userId}`);
			}

			return result;
		} catch (error) {
			console.error('Failed to send message to RabbitMQ:', error);
			return false;
		}
	}
}
