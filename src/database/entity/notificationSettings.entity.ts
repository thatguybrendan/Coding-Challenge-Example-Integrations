import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'
import { NotificationType } from '../../types/notificationType.type'
import { IsEmail, IsPhoneNumber } from 'class-validator'
@Entity('NotificationSettings')
@Unique('notification_settings_UNIQUE_INDEX_userId', ['userId'])
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.NONE,
  })
  notificationType: NotificationType

  @Column({ nullable: true })
  @IsEmail()
  email: string

  @Column({ nullable: true })
  @IsPhoneNumber()
  phone: string
}
