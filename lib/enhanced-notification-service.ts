// Enhanced notification service placeholder
// This file is disabled for build compatibility

export class EnhancedNotificationService {
  static async sendPushNotification() {
    console.log('Push notifications not configured');
  }

  static getMorningReminderPayload() {
    return { title: 'Good Morning!', body: 'Start your day right!' };
  }

  static getEveningReminderPayload() {
    return { title: 'Evening Check-in', body: 'How was your day?' };
  }

  static getMissedDayPayload() {
    return { title: 'Gentle Reminder', body: 'Ready to get back on track?' };
  }

  static async sendToAllUserDevices(userId: any, payload: any) {
    console.log('Sending to user devices:', userId, payload);
    return { sent: 0, failed: 0 };
  }
}

export default EnhancedNotificationService;