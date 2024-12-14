export class CleanUp1734184595094 {
    constructor() {
        this.name = 'CleanUp1734184595094'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_6dc44f1ceb65b1e72bacef2ca27"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "pinnedPageId"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "pinnedPageId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_6dc44f1ceb65b1e72bacef2ca27" UNIQUE ("pinnedPageId")`);
    }
}
