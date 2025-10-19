import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Глобальная валидация
	app.useGlobalPipes(new ValidationPipe());

	// CORS для TMA
	app.enableCors({
		origin: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	});

	const port = process.env.PORT || 3000;
	await app.listen(port);

	console.log(`VVIkonBot TMA backend running on port ${port}`);
}

bootstrap();
