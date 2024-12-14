export class ForceInvitationCodeForRegistration1734142248908 {
    constructor() {
        this.name = 'ForceInvitationCodeForRegistration1734142248908'
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muterId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_createdAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muteeId"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableRegistration"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "emailRequiredForSignup"`);
        await queryRunner.query(`COMMENT ON COLUMN "note"."updatedAt" IS 'The updated date of the Note.'`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS 'The created date of the Muting.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS 'The mutee user ID.'`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS 'The muter user ID.'`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "UQ_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`CREATE INDEX "IDX_4d047e2d64406dcdacdd6c5c01" ON "note" ("updatedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d1259a2c2b7bb413ff449e8711" ON "renote_muting" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_7eac97594bcac5ffcf2068089b" ON "renote_muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7aa72a5fe76019bfe8e5e0e8b7" ON "renote_muting" ("muterId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "promo_note" DROP CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_publickey" DROP CONSTRAINT "FK_10c146e4b39b443ede016f6736d"`);
        await queryRunner.query(`ALTER TABLE "user_keypair" DROP CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6"`);
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa72a5fe76019bfe8e5e0e8b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7eac97594bcac5ffcf2068089b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1259a2c2b7bb413ff449e8711"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d047e2d64406dcdacdd6c5c01"`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "UQ_e263909ca4fe5d57f8d4230dd5c" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "promo_note" ADD CONSTRAINT "FK_e263909ca4fe5d57f8d4230dd5c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "UQ_10c146e4b39b443ede016f6736d" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ADD CONSTRAINT "FK_10c146e4b39b443ede016f6736d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "UQ_f4853eb41ab722fe05f81cedeb6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_keypair" ADD CONSTRAINT "FK_f4853eb41ab722fe05f81cedeb6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "UQ_da851e06d0dfe2ef397d8b1bf1b" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_da851e06d0dfe2ef397d8b1bf1b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muterId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."muteeId" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "renote_muting"."createdAt" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muteeId", "muterId") `);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`COMMENT ON COLUMN "note"."updatedAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "emailRequiredForSignup" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableRegistration" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_createdAt" ON "muting" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId") `);
    }
}
