import { NotificationDTO } from '../types/Notification.type'
import notificationsService from '../services/notifications.service'
import { Request, Response } from 'express'
const post = async (req: Request, res: Response): Promise<void> => {
  const userId: number = parseInt(req.params.userId, 10) || null
  const notification: NotificationDTO = req.body

  try {
    await notificationsService.sendNotification(userId, notification)
    res.status(200).send()
  } catch (e) {
    console.error('Could not send notification.', e)
    res.status(500).send()
  }
}

export default { post }
