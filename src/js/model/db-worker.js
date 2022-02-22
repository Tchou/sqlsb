import initSqlJs from 'sql.js/dist/sql-asm'

/**
 * @type {SQL.Database}
 */
let db = null;

/**
 * @param {SQL.StatementIterator } it
 * @param {SQL.Statement} stmt
*/
function executeStatement(it, stmt) {

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

function runSQL(sql) {
    /**
    @type SQL.StatementIterator
    */
    const it = db.iterateStatements(sql);
    const results = [];
    try {
        for (const stmt of it) {
            const res = executeStatement(it, stmt);
            results.push(res);
            if (!res.success) break;
        }
    } catch (e) {
        /**
         *  @type Error
         */
        const e2 = e;
        console.log(e2.name);
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
                self.postMessage({type : "INIT"});
                break;

            case "LOAD":
                if (db != null) {
                    db.close();
                }
                db = new SQL.Database(msg.data);
                self.postMessage({ type : "LOADED"});
                break;

            case "EXECUTE":
                self.postMessage({ type: "RESULTS", data: runSQL(msg.data) });
                break;

            case "TABLES":
                let res = runSQL("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;");
                res = res[0];
                self.postMessage({ type: "TABLES", data: res.values });
                break;

            case "EXPORT":
                const array = db.export();
                self.postMessage({ type: "EXPORT", data: array }, [array.buffer]);
                break;

            default:

        }

    });
});