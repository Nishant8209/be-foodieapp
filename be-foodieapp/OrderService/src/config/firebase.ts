import admin from "firebase-admin";
import path from "path";

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

if (!admin.apps.length) {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const fcm = admin.messaging();
