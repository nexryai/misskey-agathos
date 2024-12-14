export class CleanUp1734184072918 {
    constructor() {
        this.name = 'CleanUp1734184072918'
    }

    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE "page_like" CASCADE`);
        await queryRunner.query(`DROP TABLE "page" CASCADE`);
    }

    async down(queryRunner) {}

}
