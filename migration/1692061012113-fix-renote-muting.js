export class fixRenoteMuting1692061012113 {
	constructor() {
		this.name = 'fixRenoteMuting1692061012113';
	}

	async up(queryRunner) {
		await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `);
		await queryRunner.query(`DELETE FROM "renote_muting" WHERE "muteeId" NOT IN (SELECT "id" FROM "user")`);
		await queryRunner.query(`DELETE FROM "renote_muting" WHERE "muterId" NOT IN (SELECT "id" FROM "user")`);
		await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
		await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
	}
}
