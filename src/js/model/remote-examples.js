

async function fromURL(id,dbfile, sqlfile, label, baseURL) {
    try {
        const content = [Promise.resolve(id + ""),
        Promise.resolve(label),
        (await window.fetch(`${baseURL}/${sqlfile}`)).text(),
        (await window.fetch(`${baseURL}/${dbfile}`)).arrayBuffer()];
        const result = await Promise.all(content);
        return result;
    } catch (e){
        return null;
    }
}

class RemoteExamples {

    constructor() {
        this.entries = [];
    }

    async load(url) {
        if (!url) return;
        const res = await fetch(url + "/index.json");
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
