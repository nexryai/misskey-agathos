export class DropPromo1737500808020 {
    constructor() {
        this.name = 'DropPromo1737500808020'
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "promo_read" DROP CONSTRAINT "FK_a46a1a603ecee695d7db26da5f4"`);
        await queryRunner.query(`ALTER TABLE "promo_read" DROP CONSTRAINT "FK_9657d55550c3d37bfafaf7d4b05"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`DROP INDEX "IDX_2882b8a1a07c7d281a98b6db16"`);
        await queryRunner.query(`DROP INDEX "IDX_9657d55550c3d37bfafaf7d4b0"`);
        await queryRunner.query(`DROP TABLE "promo_read" CASCADE `);
        await queryRunner.query(`DROP INDEX "IDX_83f0862e9bae44af52ced7099e"`);
        await queryRunner.query(`DROP TABLE "promo_note" CASCADE `);
    }

    async down(queryRunner) {
        // No down migration
    }

}
