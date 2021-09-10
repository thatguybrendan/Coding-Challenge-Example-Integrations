import { NextFunction, Request, Response } from 'express'
import { body, ValidationChain, validationResult } from 'express-validator'
import phone from 'phone'
import { NotificationSettingsDTO } from '../types/notificationSettings.type'
import { NotificationType } from '../types/notificationType.type'

export const validateNotificationTypeSettings = (
  updatedNotificationSettings: NotificationSettingsDTO,
): string => {
  if (
    updatedNotificationSettings.notificationType === NotificationType.EMAIL &&
    !updatedNotificationSettings.email
  ) {
    return 'You must provide a valid email address for email notification type.'
  }
  if (
    updatedNotificationSettings.notificationType === NotificationType.SMS &&
    !updatedNotificationSettings.phone
  )
    return 'You must provide a valid phone number for SMS notification type.'
}

export const validationRules = (): ValidationChain[] => [
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('phone')
    .optional({ nullable: true })
    .custom(value => {
      if (!phone(value).isValid) throw new Error('Invalid value')
      return true
    })
    .customSanitizer(value =>
      phone(value).isValid ? phone(value).phoneNumber : value,
    ),
  body('notificationType').isIn([
    NotificationType.SMS,
    NotificationType.EMAIL,
    NotificationType.NONE,
  ]),
  body().custom(value => {
    const typeValidationErrors = validateNotificationTypeSettings(value)
    if (typeValidationErrors) throw new Error(typeValidationErrors)
    return true
  }),
]

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    next()
  }
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
  }
}
