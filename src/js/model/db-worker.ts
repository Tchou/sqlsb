import initSqlJs, { Database, Statement } from 'sql.js'
import wasmDataUri from 'sql.js/dist/sql-wasm-browser.wasm';

const thisWorker: Worker = self as any as Worker;

let db: Database = null;
let running: boolean = false;

function executeStatement(stmt: Statement): OkResult {

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
let pause: () => Promise<number>;
if (typeof globalThis.requestAnimationFrame == "function")
    pause = () => new Promise((n) => globalThis.requestAnimationFrame(n));
else
    pause = () => new Promise((ok) => setTimeout(ok, 100));

async function runSQL(sql: string, noblock?: boolean): Promise<Array<Result>> {

    const it = db.iterateStatements(sql);
    const results = [];
    let i = 0;
    try {
        for (const stmt of it) {
            const res = executeStatement(stmt);
            results.push(res);
            stmt.free();
            if (!res.success) break;
            if (!noblock && i++ % 5000 == 0) {
                await pause();
                if (!running) {
                    throw "#INTERRUPT#";
                }
            }
        }
    } catch (e) {
        results.push({
            success: false,
            error: e,
            sql: it.getRemainingSQL()
        });
    }
    return results;

}
let SQL = null;
thisWorker.addEventListener("message", async (ev) => {
    const msg: Message = ev.data;
    switch (msg.type) {
        case "INIT":
            while (SQL == null) {
                await pause();
            }
            thisWorker.postMessage({ type: "INIT" });
            break;

        case "LOAD":
            if (db != null) {
                db.close();
            }
            db = new SQL.Database(msg.data);
            db.create_function("MOD", (x, y) => x % y);
            thisWorker.postMessage({ type: "LOADED" });
            break;

        case "EXECUTE":
            running = true;
            runSQL(msg.data).then((data) => {
                running = false;
                thisWorker.postMessage({ type: "RESULTS", data });
            });
            break;

        case "GET-TABLES":
            running = true;
            runSQL("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
                .then(res => {
                    running = false;
                    const r0 = res[0];
                    if (!r0.success) throw "Error running builtin query"
                    thisWorker.postMessage({ type: "TABLES", data: r0.values });
                });
            break;

        case "EXPORT":
            const array = db.export();
            thisWorker.postMessage({ type: "EXPORTED", data: array }, [array.buffer]);
            break;

        case "INTERRUPT":
            running = false;
            break;

        default:

    }

});
initSqlJs({
    locateFile: () => wasmDataUri
}).then(o => { SQL = o });