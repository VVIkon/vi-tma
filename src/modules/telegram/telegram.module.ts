import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';

@Global() // ← Делаем сервис глобально доступным
@Module({
	imports: [ConfigModule],
	providers: [TelegramService],
	exports: [TelegramService], // ← Явно экспортируем сервис
})
export class TelegramModule {}
