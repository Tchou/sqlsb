import initSqlJs from 'sql.js/dist/sql-asm'

/**
 * @type {SQL.Database}
 */
let db = null;
let running = false;
/**
 * @param {SQL.StatementIterator } it
 * @param {SQL.Statement} stmt
*/
function executeStatement(stmt) {

    const sql = stmt.getSQL();
    let next = stmt.step();
    let schema = stmt.getColumnNames();
    let values = [];
    while (next) {
        values.push(stmt.get());
        next = stmt.step();
    }
    return {
        success: true,
        kind: schema.length == 0 ? "update" : "query",
        sql,
        schema,
        values
    };

}
function pause() {
    return new Promise(requestAnimationFrame);
}

async function runSQL(sql, noblock) {

    const it = db.iterateStatements(sql);
    const results = [];
    let i = 0;
    try {
        for (const stmt of it) {
            const res = executeStatement(stmt);
            results.push(res);
            if (!res.success) break;
            if (!noblock && i++ % 5000 == 0) {
                await pause();
                if (!running) {
                    throw { message: "#INTERRUPT#" }
                }

            }
        }
    } catch (e) {
        results.push({
            success: false,
            error: e.message,
            sql: it.getRemainingSQL()
        });
    }
    return results;

}
initSqlJs().then(SQL => {
    self.addEventListener("message", (ev) => {
        const msg = ev.data;
        switch (msg.type) {
            case "INIT":
                self.postMessage({ type: "INIT" });
                break;

            case "LOAD":
                if (db != null) {
                    db.close();
                }
                db = new SQL.Database(msg.data);
                db.create_function("MOD", (x, y) => x % y);
                self.postMessage({ type: "LOADED" });
                break;

            case "EXECUTE":
                running = true;
                runSQL(msg.data).then((data) => {
                    running = false;
                    self.postMessage({ type: "RESULTS", data });
                });
                break;

            case "TABLES":
                running = true;
                runSQL("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;", true)
                    .then(res => {
                        running = false;
                        res = res[0];
                        self.postMessage({ type: "TABLES", data: res.values });
                    });
                break;

            case "EXPORT":
                const array = db.export();
                self.postMessage({ type: "EXPORT", data: array }, [array.buffer]);
                break;

            case "INTERRUPT":
                running = false;
                break;

            default:

        }

    });
});