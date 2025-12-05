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
