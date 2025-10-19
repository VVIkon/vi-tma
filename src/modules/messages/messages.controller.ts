import { Controller, Post, Body, Headers, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TelegramService } from '../telegram/telegram.service';
import { MessagePayload } from '../../common/interfaces/message.interface';

@Controller('api/messages')
export class MessagesController {
	constructor(
		private readonly messagesService: MessagesService,
		private readonly telegramService: TelegramService,
	) {}

	@Post('send')
	async sendMessage(@Body() messageData: MessagePayload, @Headers('x-telegram-init-data') initDataHeader: string) {
		try {
			// Проверяем авторизацию через Telegram
			if (!initDataHeader) {
				throw new UnauthorizedException('Telegram init data missing');
			}

			// Парсим и проверяем init data
			const initData = this.telegramService.parseInitData(initDataHeader);
			const isValid = this.telegramService.validateInitData(initData);

			if (!isValid) {
				throw new UnauthorizedException('Invalid Telegram init data');
			}

			// Проверяем, что userId из тела запроса совпадает с авторизованным пользователем
			if (initData.user && messageData.userId !== initData.user.id) {
				throw new UnauthorizedException('User ID mismatch');
			}

			const result = await this.messagesService.sendMessage(messageData);

			if (result) {
				return {
					success: true,
					message: 'Message sent to queue successfully',
					timestamp: new Date(),
				};
			} else {
				throw new Error('Failed to send message to queue');
			}
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}

			throw new HttpException(
				{
					success: false,
					error: error.message,
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Post('send-to-user')
	async sendMessageToUser(
		@Body() data: { userId: number; text: string },
		@Headers('x-telegram-init-data') initDataHeader: string,
	) {
		try {
			// Проверяем авторизацию (только для примера - в реальности нужны права администратора)
			if (!initDataHeader) {
				throw new UnauthorizedException('Telegram init data missing');
			}

			const initData = this.telegramService.parseInitData(initDataHeader);
			const isValid = this.telegramService.validateInitData(initData);

			if (!isValid) {
				throw new UnauthorizedException('Invalid Telegram init data');
			}

			// Отправляем сообщение через Bot API
			const result = await this.telegramService.sendMessage(data.userId, data.text);

			return {
				success: result,
				message: result ? 'Message sent to user' : 'Failed to send message',
			};
		} catch (error) {
			throw new HttpException(
				{
					success: false,
					error: error.message,
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
