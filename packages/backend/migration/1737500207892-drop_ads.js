export class DropAds1737500207892 {
    constructor() {
        this.name = 'DropAds1737500207892'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ad" DROP COLUMN "ratio"`);
        await queryRunner.query(`DROP INDEX "IDX_2da24ce20ad209f1d9dc032457"`);
        await queryRunner.query(`DROP INDEX "IDX_1129c2ef687fc272df040bafaa"`);
        await queryRunner.query(`DROP TABLE "ad" CASCADE`);
    }

    async down(queryRunner) {
        // No down migration
    }

}
