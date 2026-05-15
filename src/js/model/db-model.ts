import { customFetch } from "./local-fetch";

const DB_WORKER_SCRIPT = 'db-worker.js';

function postMessageAsync(worker: Worker, msg: QueryMessage): Promise<ResponseMessage> {
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
async function sendMessage(w: Worker, p: QueryInit): Promise<ResponseInitialized>
async function sendMessage(w: Worker, p: QueryLoad): Promise<ResponseLoaded>
async function sendMessage(w: Worker, p: QueryGetTables): Promise<ResponseTables>
async function sendMessage(w: Worker, p: QueryExecute): Promise<ResponseResults>
async function sendMessage(w: Worker, p: QueryExport): Promise<ResponseExported>
async function sendMessage(w: Worker, p: QueryInterrupt): Promise<ResponseResults>
async function sendMessage(w: Worker, p) {
    const r = await postMessageAsync(w, p);
    if (p.type == "INIT" && r.type == "INITIALIZED" ||
        p.type == "LOAD" && r.type == "LOADED" ||
        p.type == "GET-TABLES" && r.type == "TABLES" ||
        p.type == "EXECUTE" && r.type == "RESULTS" ||
        p.type == "EXPORT" && r.type == "EXPORTED" ||
        p.type == "INTERRUPT" && r.type == "RESULTS"
    ) return r;
    throw `Incompatible query ${p.type} and response ${r.type}`
}


async function checkInit(o: DbModel): Promise<void> {
    if (o.initialized == true) return;
    const scriptP = await o.workerP;
    const code = await scriptP.text();
    const blob = new Blob([code]);
    o.worker = new Worker(URL.createObjectURL(blob));
    await sendMessage(o.worker, { type: "INIT" });
    o.initialized = true;
}

export class DbModel {
    worker: Worker;
    workerP: Promise<CustomFetch>;
    initialized: boolean;
    numTables: number;
    totalUpdates: number;
    dirty: boolean;
    private __history: Array<string>;

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

    async load(data?: Uint8Array<ArrayBuffer>): Promise<void> {
        await checkInit(this);
        await sendMessage(this.worker, {
            type: "LOAD",
            data
        });
        this.numTables = -1;
        this.totalUpdates = 0;
        this.dirty = false;
    }

    async tables(): Promise<any[]> {
        await checkInit(this);
        const msg = await sendMessage(this.worker, {
            type: "GET-TABLES"
        });
        let res = [];
        if (Array.isArray(msg.data)) res = msg.data;
        if (this.numTables >= 0 && res.length != this.numTables)
            this.dirty = true;
        this.numTables = res.length;
        return res;
    }

    async interrupt(): Promise<void> {
        await checkInit(this);
        await sendMessage(this.worker, { type: "INTERRUPT" });
    }

    async evalSQL(sql: string) {
        await checkInit(this);
        const msg = await sendMessage(this.worker, {
            type: "EXECUTE",
            data: sql
        });
        for (const res of msg.data) {
            if (res.success) {
                this.__history.push(res.sql);
            }
        }

        let mod = await sendMessage(this.worker, {
            type: "EXECUTE",
            data: "SELECT total_changes();"
        });
        if (mod.data[0].success) {
            let updates: number = mod.data[0].values[0][0];
            if (updates != this.totalUpdates) {
                this.dirty = true;
                this.totalUpdates = updates;
            }
        }
        return msg.data;
    }

    async export() {
        await checkInit(this);
        let msg = await sendMessage(this.worker, {
            type: "EXPORT"
        });
        return msg.data;
    }

    get history() { return this.__history.values(); }
    clearHistory() { this.__history.length = 0; }

}
