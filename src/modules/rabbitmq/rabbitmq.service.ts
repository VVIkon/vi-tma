import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RabbitMQConfig } from '../../common/interfaces/message.interface';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
	private connection: amqp.Connection;
	private channel: amqp.Channel;

	constructor(private configService: ConfigService) {}

	async getChannel(): Promise<amqp.Channel> {
		if (!this.connection) {
			await this.connect();
		}
		return this.channel;
	}

	private async connect() {
		try {
			const config = this.getConfig();

			this.connection = await amqp.connect(config.url);
			this.channel = await this.connection.createChannel();

			// Assert exchange
			await this.channel.assertExchange(config.exchange, 'direct', {
				durable: true,
			});

			// Assert queue
			await this.channel.assertQueue(config.queue, { durable: true });

			// Bind queue to exchange
			await this.channel.bindQueue(config.queue, config.exchange, config.routingKey);

			console.log('RabbitMQ connected successfully');

			this.connection.on('close', () => {
				console.log('RabbitMQ connection closed');
				setTimeout(() => this.connect(), 5000);
			});
		} catch (error) {
			console.error('RabbitMQ connection failed:', error);
			setTimeout(() => this.connect(), 5000);
		}
	}

	private getConfig(): RabbitMQConfig {
		return {
			url: this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
			exchange: this.configService.get<string>('RABBITMQ_EXCHANGE') || 'vvikon_exchange',
			queue: this.configService.get<string>('RABBITMQ_QUEUE') || 'vvikon_queue',
			routingKey: this.configService.get<string>('RABBITMQ_ROUTING_KEY') || 'messages',
		};
	}

	async onModuleDestroy() {
		if (this.channel) {
			await this.channel.close();
		}
		if (this.connection) {
			await this.connection.close();
		}
	}
}
