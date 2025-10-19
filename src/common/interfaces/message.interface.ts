export interface MessagePayload {
  userId: number;
  textMessage: string;
  sendData: Date;
}

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKey: string;
}
