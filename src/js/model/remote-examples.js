

async function fromURL(file, name, baseURL) {
    try {
        const content = [Promise.resolve(file),
        Promise.resolve(name),
        (await window.fetch(`${baseURL}/${file}.sql`)).text(),
        (await window.fetch(`${baseURL}/${file}.db`)).arrayBuffer()];
        const result = await Promise.all(content);
        return result;
    } catch {
        return null;
    }
}

class RemoteExamples {

    constructor() {
        this.entries = [];
    }

    async load(url) {
        if (!url) return;
        const res = await fetch(url + "/index.txt");
        const text = await res.text();
        const entries = [];
        for (const name of text.split('\n')) {
            const fields = name.split(':');
            if (fields.length != 2) continue;
            const [label, file] = fields;
            const entry = fromURL(file, label, url);
            if (entry) entries.push(entry);
        }
        this.entries = await Promise.all(entries);
    }
}

export const getInstance =
    (() => {
        const singleton = new RemoteExamples();
        return (() => singleton)
    })();
