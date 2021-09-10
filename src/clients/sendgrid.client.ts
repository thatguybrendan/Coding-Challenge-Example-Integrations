import { NotificationDTO } from '../types/Notification.type'
import sendgrid from 'sendgrid'

const sendgridApiKey = process.env.SENDGRID_API_KEY || ''
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || ''

const client = sendgrid(sendgridApiKey)

const generateEmail = (email: string, notification: NotificationDTO) => {
  const helper = sendgrid.mail
  const fromEmail = new helper.Email(sendgridFromEmail)
  const toEmail = new helper.Email(email)
  const subject = notification.title
  const content = new helper.Content('text/plain', notification.text)
  return new helper.Mail(fromEmail, subject, toEmail, content)
}

const sendNotification = async (
  email: string,
  notification: NotificationDTO,
): Promise<void> => {
  const mail = generateEmail(email, notification)
  const request = client.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  })

  await client.API(request)
}

export default { sendNotification }
