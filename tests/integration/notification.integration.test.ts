import jsonwebtoken from 'jsonwebtoken'
import Chance from 'chance'
import phone from 'phone'
import { createConnection, getConnection } from 'typeorm'
import express from 'express'
import request from 'supertest'
import passport from 'passport'
import mockedSendgrid from 'sendgrid'
const sendgrid = jest.requireActual('sendgrid')

import NotificationsRouter from '../../src/routes/notifications.router'
import { NotificationSettings } from '../../src/database/entity/notificationSettings.entity'
import { NotificationSettingsDTO } from '../../src/types/notificationSettings.type'
import { NotificationType } from '../../src/types/notificationType.type'
import { UserDTO } from '../../src/types/user.type'
import { getStrategy } from '../../src/auth/passport'
import { NotificationDTO } from '../../src/types/Notification.type'
import { createDBConnection } from '../util/db'

const jwtSecret = process.env.JWT_SECRET

// Bit of last-resort ES6 magic here.
// There is a discrepancy between how TS and Jest handle imports
// This fixes the mock ES6 class for us.
let create: jest.Mock, api: jest.Mock, emptyRequest: jest.Mock
jest.mock('twilio', () => {
  return () => {
    return {
      messages: {
        create: (...params) => create(...params),
      },
    }
  }
})

// let smth: jest.Mock
// jest.mock('sendgrid')
// const mockedSendgrid = mocked(sendgrid, true) as any
jest.mock('sendgrid', () => {
  return function () {
    return {
      API: (...params) => api(...params),
      emptyRequest: (...params) => emptyRequest(...params),
    }
  }
})

// These are all helper functions, so returning to origional state is in our best interest.
mockedSendgrid.mail = sendgrid.mail

describe('Notifications', () => {
  let userToken = ''
  let repository
  let app
  const chance = new Chance('notification')

  const generateRandomSettings = (count): NotificationSettingsDTO[] => {
    const randomSettings = Array.from(Array(count)).map(
      (): NotificationSettingsDTO => ({
        userId: chance.integer({ min: 0, max: 1000 }),
        email: chance.email(),
        phone: phone('(613) 555-5167').phoneNumber,
        notificationType:
          Object.values(NotificationType)[chance.integer({ min: 0, max: 2 })],
      }),
    )
    return randomSettings
  }

  const addNotificationSettings = async (
    count: number,
  ): Promise<NotificationSettings[]> => {
    return await repository.save(generateRandomSettings(count)).catch(error => {
      console.error('ERROR')
      console.error(error)
    })
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
    app.use('/api/notifications/notify', NotificationsRouter)

    repository = await getConnection().getRepository(NotificationSettings)
  })

  beforeEach(async () => {
    await getConnection().synchronize(true)
  })

  afterAll(async () => {
    jest.resetAllMocks()
    await getConnection().synchronize(true)
    await getConnection().close()
  })

  const notification: NotificationDTO = {
    text: 'This is a notificaiton.',
    title: 'This is a title.',
    dateTime: new Date('2021-09-07T12:00:00Z'),
  }

  describe('POST', () => {
    describe('Send Notifivation', () => {
      it('shoud notify SMS user', async () => {
        create = jest.fn().mockResolvedValue({ sid: '123' })

        const [settingsRef, ...settings] = await addNotificationSettings(10)
        const authHeaders = getAuthHeaders({ id: settingsRef.userId })

        const smsUser = settings.find(
          ns => ns.notificationType === NotificationType.SMS,
        )

        await request(app)
          .post(`/api/notifications/notify/user/${smsUser.userId}`)
          .set('Authorization', authHeaders)
          .send(notification)
          .expect(200)
        expect(create).toBeCalledWith(
          expect.objectContaining({
            body: `\nMessage from Bevy sent at 2021-09-07T12:00:00.000Z.\nTitle: This is a title.\nThis is a notificaiton.\n`,
            to: '+16135555167',
          }),
        )
      })
      it('should notify email user', async () => {
        const testRequest = {
          method: 'GET',
          path: 'test/path',
        }
        emptyRequest = jest.fn().mockReturnValue(testRequest)
        api = jest.fn()

        const [settingsRef, ...settings] = await addNotificationSettings(5)
        const authHeaders = getAuthHeaders({ id: settingsRef.userId })

        const smsUser = settings.find(
          ns => ns.notificationType === NotificationType.EMAIL,
        )

        await request(app)
          .post(`/api/notifications/notify/user/${smsUser.userId}`)
          .set('Authorization', authHeaders)
          .send(notification)
          .expect(200)

        expect(emptyRequest).toBeCalledWith(
          expect.objectContaining({
            method: 'POST',
            path: '/v3/mail/send',
            body: expect.objectContaining({
              personalizations: [
                {
                  to: [
                    expect.objectContaining({
                      email: 'aruno@cofu.st',
                    }),
                  ],
                },
              ],
              subject: 'This is a title.',
              content: [
                { type: 'text/plain', value: 'This is a notificaiton.' },
              ],
            }),
          }),
        )
        expect(api).toHaveBeenCalledWith(testRequest)
      })
    })

    describe('validation', () => {
      it('should validate title', async () => {
        create = jest.fn().mockResolvedValue({ sid: '123' })

        const [settingsRef] = await addNotificationSettings(5)
        const authHeaders = getAuthHeaders({ id: settingsRef.userId })

        await request(app)
          .post(`/api/notifications/notify/user/123`)
          .set('Authorization', authHeaders)
          .send({ ...notification, title: null })
          .expect(400)
      })

      it('should validate text', async () => {
        create = jest.fn().mockResolvedValue({ sid: '123' })

        const settings = await addNotificationSettings(5)
        const settingsReference = settings[0]
        const authHeaders = getAuthHeaders({ id: settingsReference.userId })

        await request(app)
          .post(`/api/notifications/notify/user/123`)
          .set('Authorization', authHeaders)
          .send({ ...notification, text: null })
          .expect(400)
      })
      it('should validate dateTime', async () => {
        create = jest.fn().mockResolvedValue({ sid: '123' })

        const [settingsRef] = await addNotificationSettings(5)

        const user: UserDTO = { id: settingsRef.userId }
        const authHeaders = getAuthHeaders(user)

        await request(app)
          .post(`/api/notifications/notify/user/123`)
          .set('Authorization', authHeaders)
          .send({ ...notification, dateTime: null })
          .expect(400)
      })
      it('should 404 if no userId param', async () => {
        create = jest.fn().mockResolvedValue({ sid: '123' })

        const [settingsRef] = await addNotificationSettings(5)
        const authHeaders = getAuthHeaders({ id: settingsRef.userId })

        await request(app)
          .post(`/api/notifications/notify/user/`)
          .set('Authorization', authHeaders)
          .send(notification)
          .expect(404)
      })
    })
  })
})
