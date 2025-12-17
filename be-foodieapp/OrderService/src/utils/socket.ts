import { Server as SocketIOServer } from "socket.io";
import http from "http";

let io: SocketIOServer | null = null;

export const initSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://apigateway-kl70.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 WS client connected:", socket.id);

    socket.on("registerDeliveryBoy", (deliveryBoyId: string) => {
      console.log("🆔 DeliveryBoy registered:", deliveryBoyId);
      socket.join(`deliveryBoy:${deliveryBoyId}`);
    });

    socket.on("registerUser", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("registerAdmin", () => {
      socket.join("admin");
    });

    socket.on("disconnect", () => {
      console.log("❌ WS client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
