import { customFetch } from './local_fetch'

async function fromURL(id: number, dbfile: string, sqlfile: string, label: string, baseURL: String):
    Promise<DbSelectorEntry | null> {
    try {
        return Promise.resolve([
            id + "",
            label,
            await (await customFetch(`${baseURL}/${sqlfile}`)).text(),
            await (await customFetch(`${baseURL}/${dbfile}`)).arrayBuffer()
        ]);
    } catch (e) {
        return Promise.resolve(null);
    }
}

export class RemoteExamples {

    private static instance: RemoteExamples;

    static getInstance(): RemoteExamples {
        return this.instance ??= new this();
    }


    entries: (string | DbSelectorEntry)[]

    private constructor() {
        this.entries = [];
    }

    async load(url) {
        if (!url) return;
        if (url.endsWith("/")) url = url.slice(0, -1);
        const res = await customFetch(url + "/index.json");
        const json = await res.json();
        if (!Array.isArray(json)) return;
        const entries: Promise<string | DbSelectorEntry>[] = [];
        let id = 0;
        for (const entry of json) {
            if (typeof entry === "string") {
                entries.push(Promise.resolve(entry));
            } if (entry.hasOwnProperty("label") &&
                entry.hasOwnProperty("sql_file") &&
                entry.hasOwnProperty("db_file")) {
                const res = fromURL(id++, entry.db_file, entry.sql_file, entry.label, url);
                if (res) entries.push(res);
            }
        }
        this.entries = await Promise.all(entries);
    }
}
