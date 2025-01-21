export class DropNotesScore1737503566354 {
    constructor() {
        this.name = 'DropNotesScore1737503566354';
    }

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "score"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note" ADD "score" integer NOT NULL DEFAULT '0'`);
    }

}
