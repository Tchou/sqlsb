import {customFetch} from './local_fetch'


async function fromURL(id,dbfile, sqlfile, label, baseURL) {
    try {
        const content = [Promise.resolve(id + ""),
        Promise.resolve(label),
        (await customFetch(`${baseURL}/${sqlfile}`)).text(),
        (await customFetch(`${baseURL}/${dbfile}`)).arrayBuffer()];
        const result = await Promise.all(content);
        return result;
    } catch (e){
        console.log(e.toString());
        return null;
    }
}

class RemoteExamples {

    constructor() {
        this.entries = [];
    }

    async load(url) {
        if (!url) return;
        if (url.endsWith("/")) url = url.slice(0, -1);
        const res = await customFetch(url + "/index.json");
        const json = await res.json();
        if (!Array.isArray(json)) return;
        const entries = [];
        let id = 0;
        for (const entry of json) {
            if (typeof entry == "string") {
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

export const getInstance =
    (() => {
        const singleton = new RemoteExamples();
        return (() => singleton)
    })();
