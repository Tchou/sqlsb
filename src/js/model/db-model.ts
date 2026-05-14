import { customFetch } from "./local_fetch";

const DB_WORKER_SCRIPT = 'db-worker.js';

function postMessageAsync(worker: Worker, msg: Message): Promise<Message> {
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
async function checkMessage(exp: "INIT", p: Promise<Message>): Promise<InitMessage>
async function checkMessage(exp: "LOAD", p: Promise<Message>): Promise<LoadMessage>
async function checkMessage(exp: "LOADED", p: Promise<Message>): Promise<LoadedMessage>
async function checkMessage(exp: "TABLES", p: Promise<Message>): Promise<TablesMessage>
async function checkMessage(exp: "EXECUTE", p: Promise<Message>): Promise<ExecuteMessage>
async function checkMessage(exp: "RESULTS", p: Promise<Message>): Promise<ResultsMessage>
async function checkMessage(exp: "GET-TABLES", p: Promise<Message>): Promise<GetTablesMessage>
async function checkMessage(exp: "INTERRUPT", p: Promise<Message>): Promise<InterruptMessage>
async function checkMessage(exp: "EXPORT", p: Promise<Message>): Promise<ExportMessage>
async function checkMessage(exp: "EXPORTED", p: Promise<Message>): Promise<ExportedMessage>

async function checkMessage(exp, p): Promise<Message> | never {
    const msg = await p;
    if (msg.type != exp)
        throw new Error(`Internal error: expected ${exp} but received ${msg.type} from worker`);
    return msg;
}

async function checkInit(o: DbModel): Promise<void> {
    if (o.initialized == true) return;
    const scriptP = await o.workerP;
    const code = await scriptP.text();
    const blob = new Blob([code]);
    o.worker = new Worker(URL.createObjectURL(blob));
    await checkMessage("INIT", postMessageAsync(o.worker, { type: "INIT" }));
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
        await checkMessage("LOADED",
            postMessageAsync(this.worker, {
                type: "LOAD",
                data
            }));
        this.numTables = -1;
        this.totalUpdates = 0;
        this.dirty = false;
    }

    async tables(): Promise<any[]> {
        await checkInit(this);
        const msg = await checkMessage("TABLES", postMessageAsync(this.worker, {
            type: "GET-TABLES"
        }));
        let res = [];
        if (Array.isArray(msg.data)) res = msg.data;
        if (this.numTables >= 0 && res.length != this.numTables)
            this.dirty = true;
        this.numTables = res.length;
        return res;
    }

    async interrupt(): Promise<void> {
        await checkInit(this);
        await postMessageAsync(this.worker, { type: "INTERRUPT" });
        //assertMessage("INTERRUPTED", msg);
    }

    async evalSQL(sql: string) {
        await checkInit(this);
        const msg = await checkMessage("RESULTS", postMessageAsync(this.worker, {
            type: "EXECUTE",
            data: sql
        }));
        for (const res of msg.data) {
            if (res.success) {
                this.__history.push(res.sql);
            }
        }

        let mod = await checkMessage("RESULTS", postMessageAsync(this.worker, {
            type: "EXECUTE",
            data: "SELECT total_changes();"
        }));
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
        let msg = await checkMessage("EXPORTED", postMessageAsync(this.worker, {
            type: "EXPORT"
        }));
        return msg.data;
    }

    get history() { return this.__history.values(); }
    clearHistory() { this.__history.length = 0; }

}
