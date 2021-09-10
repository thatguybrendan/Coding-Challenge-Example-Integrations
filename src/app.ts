// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

import express from 'express'
import passport from 'passport'
import { createConnection } from 'typeorm'

import { getStrategy } from './auth/passport'
import NotificationSettingsRouter from './routes/notificationSettings.router'
import NotificationsRouter from './routes/notifications.router'

const launchApp = async () => {
  const app = express()

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  passport.use(getStrategy())

  app.use('/api/notifications/settings', NotificationSettingsRouter)
  app.use('/api/notifications/notify', NotificationsRouter)
  app.get('/', (req, res) => {
    res.send('Welcome to the Notifications test app.')
  })

  await createConnection()

  const PORT = process.env.PORT || 8080
  app.listen(PORT, function () {
    console.log(`App started on ${PORT}`)
  })
}

launchApp()
