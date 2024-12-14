export class RemoveEmailRelatedFeatures1734166731987 {
    constructor() {
        this.name = 'RemoveEmailRelatedFeatures1734166731987'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableEmail"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableActiveEmailValidation"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "blockedEmailDomains"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "emailVerifyCode"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "emailVerified"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "receiveAnnouncementEmail"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "emailNotificationTypes"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "emailNotificationTypes" jsonb NOT NULL DEFAULT '["follow", "receiveFollowRequest", "groupInvited"]'`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "receiveAnnouncementEmail" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "emailVerifyCode" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "email" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "blockedEmailDomains" character varying(256) array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableActiveEmailValidation" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "email" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableEmail" boolean NOT NULL DEFAULT false`);
    }
}
