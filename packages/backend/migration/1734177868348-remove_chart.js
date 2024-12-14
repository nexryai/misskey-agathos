export class RemoveChart1734177868348 {
    constructor() {
        this.name = 'RemoveChart1734177868348'
    }

    async up(queryRunner) {
        // チャート関連のテーブルを取得
        const tables = await queryRunner.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name LIKE '__chart%';
        `);

        // 該当テーブルを削除
        for (const table of tables) {
            const tableName = table.table_name;
            await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        }
    }

    async down(queryRunner) {
        // Impossible
    }

}
