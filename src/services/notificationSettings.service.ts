import { getConnection } from 'typeorm'
import { NotificationSettings } from '../database/entity/notificationSettings.entity'
import { NotificationSettingsDTO } from '../types/notificationSettings.type'

const getNotificationSettings = async (
  userId: number,
): Promise<NotificationSettingsDTO> => {
  const repository = await getConnection().getRepository(NotificationSettings)
  return repository
    .createQueryBuilder('NotificationSettings')
    .where(`"userId" = :id`, { id: userId })
    .getOneOrFail()
}

const upsertNotificationSettings = async (
  userId: number,
  updatedNotificationSettings: NotificationSettingsDTO,
): Promise<void> => {
  const repository = await getConnection().getRepository(NotificationSettings)
  const notificationSettings = await repository
    .createQueryBuilder('NotificationSettings')
    .where(`"userId" = :id`, { id: userId })
    .getOne()

  if (notificationSettings) {
    await repository
      .createQueryBuilder()
      .update()
      .set(updatedNotificationSettings)
      .where(`"userId" = :id`, { id: userId })
      .execute()
  } else {
    const newNotificationSettings = repository.create({
      ...updatedNotificationSettings,
      userId: userId,
    })

    await repository
      .createQueryBuilder()
      .insert()
      .values(newNotificationSettings)
      .execute()
  }
}

export default { getNotificationSettings, upsertNotificationSettings }
