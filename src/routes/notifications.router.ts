import { Router } from 'express'
import passport from 'passport'

import notificationsController from '../controllers/notification.controller'
import { validationRules, validate } from '../validators/notification.validator'

const router = Router()

router.post(
  '/user/:userId',
  passport.authenticate('jwt', { session: false }),
  validationRules(),
  validate,
  notificationsController.post,
)

export default router
