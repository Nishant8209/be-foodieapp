// import amqp from 'amqplib';

// export const consumeOrderCreated = async () => {
//   const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
//   const channel = await connection.createChannel();
//   await channel.assertQueue('order_created', { durable: true });

//   channel.consume('order_created', async (msg) => {
//     const order = JSON.parse(msg.content.toString());
//     console.log('📥 Order received in User Service:', order);
//     channel.ack(msg);
//   });
// };
