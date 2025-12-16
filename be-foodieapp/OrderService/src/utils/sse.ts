// lib/sse.ts
import type { ServerResponse } from "http";

const clients: ServerResponse[] = [];

// Add a client when they connect
export const addSSEClient = (res: ServerResponse) => {
  clients.push(res);
  console.log(`🔌 SSE Client connected. Total: ${clients.length}`);
};

// Remove a client on disconnect
export const removeSSEClient = (res: ServerResponse) => {
  const index = clients.indexOf(res);
  if (index > -1) {
    clients.splice(index, 1);
  }
  console.log(`❌ SSE Client removed. Total: ${clients.length}`);
};

// Broadcast event to all SSE clients
export const broadcastStatusUpdate = (data: any) => {
  const payload = `event: statusUpdate\ndata: ${JSON.stringify(data)}\n\n`;

  clients.forEach((res) => {
    try {
      res.write(payload); // Push event
    } catch (err) {
      removeSSEClient(res);
    }
  });

  console.log(`📢 Broadcast sent to ${clients.length} clients`);
};

export const broadcastEvent = (data: any) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`; // default 'message' event
  clients.forEach((res) => {
    try {
      res.write(payload);
    } catch (err) {
      removeSSEClient(res);
    }
  });
};


// Add this new function - sends to specific delivery boy only
export const broadcastToDeliveryBoy = (deliveryBoyId: string, data: any) => {
  const payload = `event: orderAssigned\ndata: ${JSON.stringify(data)}\n\n`;

  clients.forEach((res) => {
    try {
      // Check if this client belongs to target delivery boy
      if ((res as any).deliveryBoyId === deliveryBoyId) {
        res.write(payload);
      }
    } catch (err) {
      removeSSEClient(res);
    }
  });

  console.log(`📢 Sent to deliveryBoy ${deliveryBoyId}:`, data);
};