import { Router } from 'express'
import passport from 'passport'

import notificationSettignsController from '../controllers/notificationSettings.controller'
import {
  validationRules,
  validate,
} from '../validators/notificationSettings.validator'

const router = Router()
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  notificationSettignsController.get,
)
router.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  validationRules(),
  validate,
  notificationSettignsController.upsert,
)

export default router
