import { fcm } from "../config/firebase";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export class NotificationService {
  static async sendPushNotificationToToken(
    fcmToken: string,
    payload: PushPayload
  ) {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    await fcm.send(message);
  }

  static async sendPushNotificationToUser(
    user: { fcmToken?: string | null },
    payload: PushPayload
  ) {
    if (!user?.fcmToken) {
      console.log("User has no FCM token, skip push");
      return;
    }

    await this.sendPushNotificationToToken(user.fcmToken, payload);
  }
}
