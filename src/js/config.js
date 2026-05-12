export function setOption(k, v) {

    if (globalThis.localStorage) {
        globalThis.localStorage.setItem("sqlsb-" + k, v);
    }
}

export function getOption(k, v) {
    if (globalThis.localStorage) {
        return globalThis.localStorage.getItem("sqlsb-" + k);
    }
    return null;
}