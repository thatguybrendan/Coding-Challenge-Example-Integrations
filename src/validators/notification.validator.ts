import { NextFunction, Request, Response } from 'express'
import {
  body,
  ValidationChain,
  validationResult,
  param,
} from 'express-validator'

export const validationRules = (): ValidationChain[] => [
  body('title').isString(),
  body('text').isString(),
  body('dateTime').isISO8601(),
  param('userId').isString(),
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
