import axios from 'axios';

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export class NotificationService {
  static async sendPushNotificationToToken(
    expoToken: string, // Changed: expoToken, not fcmToken
    payload: PushPayload
  ) {
    try {
      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        [
          {
            to: expoToken,
            sound: 'default',
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
            channelId: 'default',
            priority: 'high',
          },
        ],
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('✅ Expo push sent:', response.data.data[0].status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Expo push failed:', error.response?.data || error.message);
      throw error;
    }
  }

  static async sendPushNotificationToUser(
    user: { expoPushToken?: string | null }, // Changed: expoPushToken
    payload: PushPayload
  ) {
    if (!user?.expoPushToken) {
      console.log("⚠️ User has no Expo token, skip push");
      return;
    }

    await this.sendPushNotificationToToken(user.expoPushToken, payload);
  }
}
