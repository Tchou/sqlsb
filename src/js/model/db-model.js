import { customFetch } from "./local_fetch";

const DB_WORKER_SCRIPT = 'db-worker.js';

function postMessageAsync(worker, msg) {
    return new Promise((resolve, reject) => {

        worker.addEventListener("message", function handler(ev) {
            resolve(ev.data);
        }, { once: true });
        try {
            worker.postMessage(msg);
        } catch (e) {
            reject(e);
        }
    });

}

function assertMessage(exp, msg) {
    if (msg.type != exp)
        throw new Error(`Internal error: expected ${exp} but received ${msg.type} from worker`);
}

async function checkInit(o) {
    if (o.initialized) return;
    const scriptP = await o.workerP;
    const code = await scriptP.text();
    const blob = new Blob([code]);
    o.worker = new Worker (URL.createObjectURL(blob));
    const msg = await postMessageAsync(o.worker, { type: "INIT" });
    assertMessage("INIT", msg);
    o.initialized = true;
}

export class DbModel {

    constructor(baseURL) {
        let url = "";
        if (baseURL) {
            url = baseURL + "/" + DB_WORKER_SCRIPT;
        } else {
            url = DB_WORKER_SCRIPT;
        }
        this.workerP = customFetch(url);
        this.worker = null;
        this.numTables = -1;
        this.totalUpdates = 0;
        this.__history = [];
        this.dirty = false;
    }

    async load(data) {
        await checkInit(this);
        let msg = await postMessageAsync(this.worker, {
            type: "LOAD",
            data
        });
        this.numTables = -1;
        this.totalUpdates = 0;
        this.dirty = false;
        assertMessage("LOADED", msg);
    }

    async tables() {
        await checkInit(this);
        let msg = await postMessageAsync(this.worker, {
            type: "TABLES"
        });
        assertMessage("TABLES", msg);
        let res = [];
        if (Array.isArray(msg.data)) res = msg.data;
        if (this.numTables >= 0 && res.length != this.numTables)
            this.dirty = true;
        this.numTables = res.length;
        return res;
    }

    async interrupt(){
        await checkInit(this);
        this.worker.postMessage({ type : "INTERRUPT" });
        //assertMessage("INTERRUPTED", msg);
    }

    async evalSQL(sql) {
        await checkInit(this);
        let msg = await postMessageAsync(this.worker, {
            type: "EXECUTE",
            data: sql
        });
        assertMessage("RESULTS", msg);
        for (const res of msg.data) {
            if (res.success) {
                this.__history.push(res.sql);
            }
        }

        let mod = await postMessageAsync(this.worker, {
            type: "EXECUTE",
            data: "SELECT total_changes();"
        })
        assertMessage("RESULTS", mod);
        console.log(mod);
        if (mod.data[0].success) {
            let updates = mod.data[0].values[0];
            if (updates != this.totalUpdates) {
                this.dirty = true;
                this.totalUpdates = updates;
            }
        }
        return msg.data;
    }

    async export() {
        await checkInit(this);
        let msg = await postMessageAsync(this.worker, {
            type: "EXPORT"
        });
        assertMessage("EXPORT", msg);
        return msg.data;
    }

    get history() { return this.__history.values(); }
    clearHistory() { this.__history.length = 0; }

}
