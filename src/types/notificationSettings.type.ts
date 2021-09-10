import { NotificationType } from './notificationType.type'

export interface NotificationSettingsDTO {
  userId: number
  notificationType: NotificationType
  phone: string
  email: string
}
