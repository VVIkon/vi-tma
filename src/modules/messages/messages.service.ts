import { Injectable } from '@nestjs/common';
import { RabbitMQProducer } from '../rabbitmq/rabbitmq.producer';
import { MessagePayload } from '../../common/interfaces/message.interface';

@Injectable()
export class MessagesService {
	constructor(private rabbitMQProducer: RabbitMQProducer) {}

	async sendMessage(messageData: MessagePayload): Promise<boolean> {
		// Валидация данных
		if (!this.validateMessage(messageData)) {
			throw new Error('Invalid message data');
		}

		// Отправка в RabbitMQ
		return await this.rabbitMQProducer.sendMessage(messageData);
	}

	private validateMessage(message: MessagePayload): boolean {
		return (
			message.userId !== undefined &&
			typeof message.textMessage === 'string' &&
			message.textMessage.trim().length > 0 &&
			message.sendData instanceof Date
		);
	}
}
