    /**
     * @param url : String
     */

export function localFetch(url, globalObject) {
  if (!url.startsWith("builtin://")) throw `Invalid URL '${url}'`;

  const fields = url.split("/");
  if (fields.length != 4) return `Invlaid URL '${url}'`;
  const global = fields[2];
  const entry = fields[3];
  globalObject = globalObject ? globalObject : globalThis;
  return new Promise ((ok, fail) => {
    if (!globalObject.hasOwnProperty(global)) {
        fail (`Undefined global ${global} in ${url}`);
    } else if (!globalObject[global].hasOwnProperty(entry)) {
        fail (`Global ${global} has no property ${entry}`);
    } else {
        const data = globalObject[global][entry];
        const res = {
            json : () => new Promise ((ok, err) => {
                try {
                    ok (JSON.parse(data));
                } catch (e) { err(e); }
            }),
            text : () => new Promise ((ok) => {
                ok(data);
            }),
            arrayBuffer : () => new Promise( (ok, err) => {
                try {
                    ok (Uint8Array.from(globalThis.atob(data),c => c.charCodeAt(0)));
                } catch (e) {
                    err (e);
                }
            })
        };
        return ok (Promise.resolve(res));
    }

})
}

export function customFetch(url) {
    if (url.startsWith("builtin://")) return localFetch(url);
    return fetch(url);
}