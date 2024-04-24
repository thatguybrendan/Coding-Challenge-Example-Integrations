import {MigrationInterface, QueryRunner} from "typeorm";

export class NotificationSettings1631073389397 implements MigrationInterface {
    name = 'NotificationSettings1631073389397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "NotificationSettings_notificationtype_enum" AS ENUM('EMAIL', 'SMS', 'NONE')`);
        await queryRunner.query(`CREATE TABLE "NotificationSettings" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "notificationType" "NotificationSettings_notificationtype_enum" NOT NULL DEFAULT 'NONE', "email" character varying, "phone" character varying, CONSTRAINT "notification_settings_UNIQUE_INDEX_userId" UNIQUE ("userId"), CONSTRAINT "PK_a16cf2c354f0359d24e3a96ca85" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "NotificationSettings"`);
        await queryRunner.query(`DROP TYPE "NotificationSettings_notificationtype_enum"`);
    }

}
