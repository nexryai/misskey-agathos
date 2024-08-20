export class turnstile1690864358000 {
	name = 'turnstile1690864358000'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" ADD "enableTurnstile" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "turnstileSiteKey" character varying(64)`);
		await queryRunner.query(`ALTER TABLE "meta" ADD "turnstileSecretKey" character varying(64)`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "turnstileSecretKey"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "turnstileSiteKey"`);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableTurnstile"`);
	}
}
