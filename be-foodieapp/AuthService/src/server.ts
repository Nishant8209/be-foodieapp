require('dotenv').config(); // Load environment variables from .env
const app = require('./app');
const http = require('http');
const https = require('https');
const connetDataBase = require('./config/db');
const mongoose = require("mongoose");
const server = http.createServer(app);

// Start server on the specified port
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Connect Mongodb

connetDataBase()
  .then((res: any) => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      setInterval(() => {
        const client = BASE_URL.startsWith("https") ? https : http; // 👈 choose module

        client
          .get(`${BASE_URL}/health`, (res: any) => {
            res.on("data", () => {});
            res.on("end", () => {
              console.log("Self-ping successful");
            });
          })
          .on("error", (err: any) => {
            console.error("Self-ping error:", err.message);
          });
      }, 10 * 60 * 1000);
    });
  })
  .catch((err: any) => {
    console.log("err", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  try {
    await mongoose?.connection?.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

export {};
