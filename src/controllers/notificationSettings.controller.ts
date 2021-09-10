import { NotificationSettingsDTO } from '../types/notificationSettings.type'
import NotificationSettingsService from '../services/notificationSettings.service'
import { UserDTO } from '../types/user.type'
import { Request, Response } from 'express'

const upsert = async (req: Request, res: Response): Promise<void> => {
  const updatedNotificationSettings: NotificationSettingsDTO = req.body
  const user = req.user as UserDTO

  await NotificationSettingsService.upsertNotificationSettings(
    user.id,
    updatedNotificationSettings,
  )
  res.status(201).send()
}

const get = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserDTO
  try {
    const NotificationSettings =
      await NotificationSettingsService.getNotificationSettings(user.id)
    res.status(200).send(NotificationSettings)
  } catch (e) {
    res.status(404).send()
  }
}

export default { get, upsert }
