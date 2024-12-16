export class DropMessaging1734308632187 {
    constructor() {
        this.name = 'DropMessaging1734308632187'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_8fe87814e978053a53b1beb7e98"`);
        await queryRunner.query(`ALTER TABLE "antenna" DROP CONSTRAINT "FK_ccbf5a8c0be4511133dcc50ddeb"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "userGroupInvitationId"`);
        await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "userGroupJoiningId"`);
        await queryRunner.query(`ALTER TYPE "public"."antenna_src_enum" RENAME TO "antenna_src_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."antenna_src_enum" AS ENUM('home', 'all', 'users', 'list')`);
        await queryRunner.query(`ALTER TABLE "antenna" ALTER COLUMN "src" TYPE "public"."antenna_src_enum" USING "src"::"text"::"public"."antenna_src_enum"`);
        await queryRunner.query(`DROP TYPE "public"."antenna_src_enum_old"`);

        await queryRunner.query(`ALTER TABLE "user_group_invite" DROP CONSTRAINT "FK_e10924607d058004304611a436a"`);
        await queryRunner.query(`ALTER TABLE "user_group_invite" DROP CONSTRAINT "FK_1039988afa3bf991185b277fe03"`);
        await queryRunner.query(`DROP INDEX "IDX_d9ecaed8c6dc43f3592c229282"`);
        await queryRunner.query(`DROP INDEX "IDX_78787741f9010886796f2320a4"`);
        await queryRunner.query(`DROP INDEX "IDX_e10924607d058004304611a436"`);
        await queryRunner.query(`DROP INDEX "IDX_1039988afa3bf991185b277fe0"`);
        await queryRunner.query(`DROP TABLE "user_group_invite" CASCADE`);

        await queryRunner.query(`ALTER TABLE "user_group_joining" DROP CONSTRAINT "FK_67dc758bc0566985d1b3d399865"`);
        await queryRunner.query(`ALTER TABLE "user_group_joining" DROP CONSTRAINT "FK_f3a1b4bd0c7cabba958a0c0b231"`);
        await queryRunner.query(`ALTER TABLE "user_group" DROP CONSTRAINT "FK_3d6b372788ab01be58853003c93"`);
        await queryRunner.query(`ALTER TABLE "messaging_message" DROP CONSTRAINT "FK_2c4be03b446884f9e9c502135be"`);
        await queryRunner.query(`DROP INDEX "IDX_2c4be03b446884f9e9c502135b"`);
        await queryRunner.query(`ALTER TABLE "messaging_message" ALTER COLUMN "recipientId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messaging_message" DROP COLUMN "reads"`);
        await queryRunner.query(`ALTER TABLE "messaging_message" DROP COLUMN "groupId"`);
        await queryRunner.query(`DROP INDEX "IDX_67dc758bc0566985d1b3d39986"`);
        await queryRunner.query(`DROP INDEX "IDX_f3a1b4bd0c7cabba958a0c0b23"`);
        await queryRunner.query(`DROP TABLE "user_group_joining" CASCADE`);
        await queryRunner.query(`DROP INDEX "IDX_3d6b372788ab01be58853003c9"`);
        await queryRunner.query(`DROP INDEX "IDX_20e30aa35180e317e133d75316"`);
        await queryRunner.query(`DROP TABLE "user_group" CASCADE`);

        await queryRunner.query(`DROP TABLE "messaging_message" CASCADE`);
    }

    async down(queryRunner) {}
}
