
export function localFetch(url, globalObject?: any):
    Promise<LocalFetch> {
    if (!url.startsWith("builtin://")) throw `Invalid URL '${url}'`;

    const fields = url.split("/");
    if (fields.length != 4) throw `Invalid URL '${url}'`;
    const global = fields[2];
    const entry = fields[3];
    globalObject = globalObject ? globalObject : globalThis;
    return new Promise((ok, fail) => {
        if (!globalObject.hasOwnProperty(global)) {
            fail(`Undefined global ${global} in ${url}`);
        } else if (!globalObject[global].hasOwnProperty(entry)) {
            fail(`Global ${global} has no property ${entry}`);
        } else {
            const data: string = globalObject[global][entry] as any as string;
            const res = {
                json: async () => JSON.parse(data),
                text: async () => data,
                arrayBuffer: async () => Uint8Array.from(globalThis.atob(data), c => c.charCodeAt(0))
            };
            return ok(Promise.resolve(res));
        }

    })
}

export function customFetch(url: string): Promise<CustomFetch> {
    if (url.startsWith("builtin://")) return localFetch(url);
    return fetch(url);
}