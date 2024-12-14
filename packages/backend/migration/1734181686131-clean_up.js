export class CleanUp1734181686131 {
    constructor() {
        this.name = 'CleanUp1734181686131'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_f22169eb10657bded6d875ac8f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f22169eb10657bded6d875ac8f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a57f051d82c6d4036c141e107"`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "channelId"`);
        await queryRunner.query(`ALTER TABLE "note_unread" DROP COLUMN "noteChannelId"`);
        await queryRunner.query(`DROP TABLE "gallery_like" CASCADE`);
        await queryRunner.query(`DROP TABLE "gallery_post" CASCADE`);
        await queryRunner.query(`DROP TABLE "channel_following" CASCADE`);
        await queryRunner.query(`DROP TABLE "channel_note_pining" CASCADE`);
        await queryRunner.query(`DROP TABLE "channel" CASCADE`);
    }

    async down(queryRunner) {}
}
