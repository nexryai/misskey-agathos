export class DropRelay1737502355121  {
    constructor() {
        this.name = 'DropRelay1737502355121';
    }

    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_0d9a1738f2cf7f3b1c3334dfab"`);
        await queryRunner.query(`DROP TABLE "relay" CASCADE `);
        await queryRunner.query(`DROP TYPE "relay_status_enum"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "relay_status_enum" AS ENUM('requesting', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "relay" ("id" character varying(32) NOT NULL, "inbox" character varying(512) NOT NULL, "status" "relay_status_enum" NOT NULL, CONSTRAINT "PK_78ebc9cfddf4292633b7ba57aee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d9a1738f2cf7f3b1c3334dfab" ON "relay" ("inbox") `);
    }
}
