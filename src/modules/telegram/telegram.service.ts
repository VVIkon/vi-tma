import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface TelegramUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
}

export interface InitData {
	user?: TelegramUser;
	hash: string;
	auth_date: string;
}

@Injectable()
export class TelegramService {
	private readonly botToken: string;

	constructor(private configService: ConfigService) {
		this.botToken = this.configService.get<string>('BOT_TOKEN') || '';

		if (!this.botToken) {
			console.warn('BOT_TOKEN is not configured');
		}
	}

	validateInitData(initData: InitData): boolean {
		if (!this.botToken) {
			console.warn('BOT_TOKEN not configured, skipping validation');
			return true; // или false в зависимости от требований безопасности
		}

		try {
			const { hash, ...dataWithoutHash } = initData;

			// Создаем data-check-string
			const dataCheckString = Object.keys(dataWithoutHash)
				.sort()
				.map((key) => `${key}=${dataWithoutHash[key]}`)
				.join('\n');

			// Вычисляем секретный ключ
			const secretKey = crypto.createHmac('sha256', 'WebAppData').update(this.botToken).digest();

			// Вычисляем хеш
			const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

			return calculatedHash === hash;
		} catch (error) {
			console.error('Error validating init data:', error);
			return false;
		}
	}

	parseInitData(initDataString: string): InitData {
		const params = new URLSearchParams(initDataString);
		const initData: any = {};

		for (const [key, value] of params) {
			if (key === 'user') {
				initData.user = JSON.parse(value);
			} else {
				initData[key] = value;
			}
		}

		return initData;
	}

	/**
	 * Отправляет сообщение пользователю через Bot API
	 */
	async sendMessage(userId: number, text: string): Promise<boolean> {
		try {
			const telegramApiUrl = this.configService.get<string>('TELEGRAM_API_URL');
			const url = `${telegramApiUrl}/bot${this.botToken}/sendMessage`;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id: userId,
					text: text,
					parse_mode: 'HTML',
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Telegram API error:', error);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error sending message via Telegram API:', error);
			return false;
		}
	}

	/**
	 * Получает информацию о боте
	 */
	async getBotInfo() {
		try {
			const telegramApiUrl = this.configService.get<string>('TELEGRAM_API_URL');
			const response = await fetch(`${telegramApiUrl}/bot${this.botToken}/getMe`);

			return await response.json();
		} catch (error) {
			console.error('Error getting bot info:', error);
			throw error;
		}
	}
}
