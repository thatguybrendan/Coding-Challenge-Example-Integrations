import twilio from 'twilio'
import {
  MessageInstance,
  MessageListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/message'
import { NotificationDTO } from '../types/Notification.type'

const accountSid: string = process.env.TWILIO_ACCOUNT_SID || ''
const token: string = process.env.TWILIO_AUTH_TOKEN || ''

const client = twilio(accountSid, token)

const formatMessageBody = (notification: NotificationDTO): string => `
Message from Bevy sent at ${notification.dateTime}.
Title: ${notification.title}
${notification.text}
`

const sendNotification = async (
  to: string,
  notification: NotificationDTO,
): Promise<string> => {
  const body = formatMessageBody(notification)
  const from = process.env.TWILIO_FROM_NUMBER || ''
  const messageData: MessageListInstanceCreateOptions = {
    to,
    body,
    from,
  }

  const message: MessageInstance = await client.messages.create(messageData)
  return message.sid
}

export default { sendNotification }
