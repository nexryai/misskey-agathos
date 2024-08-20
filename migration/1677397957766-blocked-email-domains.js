export class blockedEmailDomains1677094546580 {
    constructor() {
        this.name = 'blockedEmailDomains1677094546580';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "blockedEmailDomains" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "blockedEmailDomains"`);
    }
}
