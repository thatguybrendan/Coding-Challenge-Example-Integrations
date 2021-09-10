import jsonwebtoken from 'jsonwebtoken'
import Chance from 'chance'
import phone from 'phone'
import express from 'express'
import request from 'supertest'
import { createConnection, getConnection, Not } from 'typeorm'
import passport from 'passport'

import NotificationSettingsRouter from '../../src/routes/notificationSettings.router'
import { NotificationSettings } from '../../src/database/entity/notificationSettings.entity'
import { NotificationSettingsDTO } from '../../src/types/notificationSettings.type'
import { NotificationType } from '../../src/types/notificationType.type'
import { UserDTO } from '../../src/types/user.type'
import { getStrategy } from '../../src/auth/passport'
import { createDBConnection } from '../util/db'

const jwtSecret = process.env.JWT_SECRET

describe('Notification Settings', () => {
  let userToken = ''
  let repository
  let app
  const chance = new Chance('notificationSettings')

  const generateRandomSettings = (count): NotificationSettingsDTO[] => {
    const randomSettings = Array.from(Array(count)).map(
      (): NotificationSettingsDTO => ({
        userId: chance.integer({ min: 0, max: 1000 }),
        email: chance.email(),
        phone: phone(chance.phone()).phoneNumber,
        notificationType:
          Object.values(NotificationType)[chance.integer({ min: 0, max: 2 })],
      }),
    )
    return randomSettings
  }

  const addNotificationSettings = async (
    count: number,
  ): Promise<NotificationSettings[]> => {
    return await repository.save(generateRandomSettings(count))
  }

  const getAuthHeaders = (user: UserDTO) => {
    const userJWT = { sub: user.id }
    userToken = jsonwebtoken.sign(userJWT, jwtSecret)
    return `Bearer ${userToken}`
  }

  beforeAll(async () => {
    await createDBConnection([NotificationSettings])

    app = express()
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    passport.use(getStrategy())
    app.use('/api/notifications/settings', NotificationSettingsRouter)

    repository = await getConnection().getRepository(NotificationSettings)
  })

  beforeEach(async () => {
    await getConnection().synchronize(true)
  })

  afterAll(async () => {
    await getConnection().synchronize(true)
    await getConnection().close()
  })

  describe('GET', () => {
    it('should get user info if it exists', async () => {
      const [settingsRef] = await addNotificationSettings(5)
      const authHeaders = getAuthHeaders({ id: settingsRef.userId })

      const result = await request(app)
        .get('/api/notifications/settings/')
        .set('Authorization', authHeaders)
        .expect(200)
      expect(result.body).toMatchObject(settingsRef)
    })
    it('should get no user info if it does not exist', async () => {
      await addNotificationSettings(5)
      const user: UserDTO = { id: 1001 } // Out of max range
      const authHeaders = getAuthHeaders(user)

      const result = await request(app)
        .get('/api/notifications/settings/')
        .set('Authorization', authHeaders)
        .expect(404)
      expect(result.body).toMatchObject({})
    })
  })

  describe('PUT', () => {
    describe('Upsert', () => {
      it('should create a user if not existing', async () => {
        const settingToAdd = await generateRandomSettings(1)[0]
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        const entriesCount = await repository.count()

        await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(201)

        const addedSetting = await repository.findOneOrFail({
          where: { userId: settingToAdd.userId },
        })
        const newEntriesCount = await repository.count()
        expect(newEntriesCount).toBe(entriesCount + 1)
        expect(addedSetting).toMatchObject(
          expect.objectContaining(settingToAdd),
        )
      })
      it('should update user if existing', async () => {
        await addNotificationSettings(5)
        const settingRef = await repository.findOneOrFail({
          where: { notificationType: Not(NotificationType.NONE) },
        })
        const authHeaders = getAuthHeaders({ id: settingRef.userId })

        const updatedSettingRef = {
          ...settingRef,
          notificationType: NotificationType.NONE,
        }

        const entriesCount = await repository.count()

        await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(updatedSettingRef)
          .expect(201)

        const addedSetting = await repository.findOneOrFail({
          where: { userId: settingRef.userId },
        })

        const newEntriesCount = await repository.count()
        expect(newEntriesCount).toBe(entriesCount)
        expect(addedSetting).toMatchObject(
          expect.objectContaining(updatedSettingRef),
        )
      })
      it('should sanitize phone input', async () => {
        const settingToAdd = {
          userId: chance.integer({ min: 0, max: 1000 }),
          notificationType: NotificationType.SMS,
          phone: '(613) 555-5170',
        }
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(201)

        const addedSetting: NotificationSettingsDTO =
          await repository.findOneOrFail({
            where: { userId: settingToAdd.userId },
          })
        expect(addedSetting.phone).toBe(phone(settingToAdd.phone).phoneNumber)
      })
    })
    describe('Validation', () => {
      it('should fail to upsert if phone notification chosen and no phone number present.', async () => {
        const settingToAdd = {
          userId: chance.integer({ min: 0, max: 1000 }),
          notificationType: NotificationType.SMS,
          phone: null,
        }
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        const result = await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(400)

        expect(result.body.errors).toContainEqual({
          location: 'body',
          msg: 'You must provide a valid phone number for SMS notification type.',
          param: '',
          value: expect.objectContaining({
            notificationType: 'SMS',
            phone: null,
          }),
        })
      })
      it('should fail to upsert if email notification chosen and no email address present', async () => {
        const settingToAdd = {
          userId: chance.integer({ min: 0, max: 1000 }),
          notificationType: NotificationType.EMAIL,
          email: null,
        }
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        const result = await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(400)

        expect(result.body.errors).toContainEqual({
          location: 'body',
          msg: 'You must provide a valid email address for email notification type.',
          param: '',
          value: expect.objectContaining({
            notificationType: 'EMAIL',
            email: null,
          }),
        })
      })
      it('should fail to upsert if email is in incorrect format.', async () => {
        const settingToAdd = {
          userId: chance.integer({ min: 0, max: 1000 }),
          notificationType: NotificationType.EMAIL,
          email: 'test@test.',
        }
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        const result = await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(400)
        expect(result.body.errors).toContainEqual({
          location: 'body',
          msg: 'Invalid value',
          param: 'email',
          value: 'test@test.',
        })
      })
      it('should fail to upsert if phone is in incorrect format.', async () => {
        const settingToAdd = {
          userId: chance.integer({ min: 0, max: 1000 }),
          notificationType: NotificationType.SMS,
          phone: '613-555-123',
        }
        const authHeaders = getAuthHeaders({ id: settingToAdd.userId })

        const result = await request(app)
          .put('/api/notifications/settings/')
          .set('Authorization', authHeaders)
          .send(settingToAdd)
          .expect(400)
        expect(result.body.errors).toContainEqual({
          location: 'body',
          msg: 'Invalid value',
          param: 'phone',
          value: '613-555-123',
        })
      })
    })
  })
})
