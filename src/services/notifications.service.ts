import { NotificationDTO } from '../types/Notification.type'
import { NotificationType } from '../types/notificationType.type'
import notificationSettingsService from './notificationSettings.service'
import twilioClient from '../clients/twilio.client'
import sendgridClient from '../clients/sendgrid.client'

const sendNotification = async (
  userId: number,
  notification: NotificationDTO,
): Promise<void> => {
  const notificationSettings =
    await notificationSettingsService.getNotificationSettings(userId)

  if (notificationSettings.notificationType === NotificationType.EMAIL) {
    await sendgridClient.sendNotification(
      notificationSettings.email,
      notification,
    )
  }
  if (notificationSettings.notificationType === NotificationType.SMS) {
    await twilioClient.sendNotification(
      notificationSettings.phone,
      notification,
    )
  }
}

export default { sendNotification }
