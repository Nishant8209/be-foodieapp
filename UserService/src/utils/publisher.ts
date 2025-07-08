// userService/publisher.ts
import amqp from 'amqplib';

export const publishUserCreated = async (user: { id: string; name: string }) => {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  const exchange = 'user_events';

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  channel.publish(exchange, '', Buffer.from(JSON.stringify({ type: 'UserCreated', data: user })));
  
  console.log('[UserService] UserCreated event published');
  await channel.close();
  await conn.close();
};
