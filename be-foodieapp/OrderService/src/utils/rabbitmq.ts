// utils/rabbitmq.ts
import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  console.log('✅ Connected to RabbitMQ');
};

export const publishToQueue = async (queue: string, data: any) => {
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
};
