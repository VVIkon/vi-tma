import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './modules/telegram/telegram.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import { MessagesModule } from './modules/messages/messages.module';
import { telegramAuthMiddleware } from './middleware/telegram-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegramModule,
    RabbitMQModule,
    MessagesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(telegramAuthMiddleware)
      .forRoutes(
        { path: '/api/*', method: RequestMethod.ALL },
        { path: '/messages/*', method: RequestMethod.ALL }
      );
  }
}
