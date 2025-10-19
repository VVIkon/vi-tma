import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { MessagePayload } from '../../common/interfaces/message.interface';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
	constructor(
		private rabbitMQService: RabbitMQService,
		private configService: ConfigService,
	) {}

	async onModuleInit() {
		await this.startConsuming();
	}

	private async startConsuming() {
		try {
			const channel = await this.rabbitMQService.getChannel();
			const queue = this.configService.get<string>('RABBITMQ_QUEUE') || 'vvikon_queue';

			await channel.consume(queue, (msg) => {
				if (msg !== null) {
					try {
						const message: MessagePayload = JSON.parse(msg.content.toString());
						this.processMessage(message);
						channel.ack(msg);
					} catch (error) {
						console.error('Error processing message:', error);
						channel.nack(msg, false, false);
					}
				}
			});

			console.log('RabbitMQ consumer started');
		} catch (error) {
			console.error('Failed to start RabbitMQ consumer:', error);
			setTimeout(() => this.startConsuming(), 5000);
		}
	}

	private processMessage(message: MessagePayload) {
		// Здесь обрабатываем сообщение из очереди
		console.log('Processing message:', {
			userId: message.userId,
			text: message.textMessage,
			timestamp: message.sendData,
		});

		// Пример обработки:
		// - Отправка в другую систему
		// - Сохранение в базу данных
		// - Интеграция с внешним API
	}
}
