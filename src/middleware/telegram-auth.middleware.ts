import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TelegramService } from '../modules/telegram/telegram.service';
import { ConfigService } from '@nestjs/config';

// Создаем экземпляр ConfigService вручную
const configService = new ConfigService();
const telegramService = new TelegramService(configService);

export function telegramAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Пропускаем публичные эндпоинты
  if (req.path === '/health' || req.path === '/api/bot-info') {
    return next();
  }

  // Проверяем авторизацию для API endpoints
  if (req.path.startsWith('/api/')) {
    const initDataHeader = req.headers['x-telegram-init-data'] as string;

    if (!initDataHeader) {
      throw new UnauthorizedException('Telegram init data required');
    }

    try {
      const initData = telegramService.parseInitData(initDataHeader);
      const isValid = telegramService.validateInitData(initData);

      if (!isValid) {
        throw new UnauthorizedException('Invalid Telegram authentication');
      }

      // Добавляем пользователя в request для дальнейшего использования
      (req as any).telegramUser = initData.user;
    } catch (error) {
      throw new UnauthorizedException('Telegram authentication failed');
    }
  }

  next();
}
