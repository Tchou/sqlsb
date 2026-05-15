type QueryInit = { type: "INIT" }
type QueryLoad = { type: "LOAD", data: Uint8Array<ArrayBuffer> }
type QueryGetTables = { type: "GET-TABLES" }
type QueryExecute = { type: "EXECUTE", data: string }
type QueryExport = { type: "EXPORT" }
type QueryInterrupt = { type: "INTERRUPT" }

type QueryMessage = QueryInit | QueryLoad | QueryGetTables | QueryExecute | QueryExport | QueryInterrupt

type ResponseInitialized = { type: "INITIALIZED" }
type ResponseLoaded = { type: "LOADED" }
type ResponseTables = { type: "TABLES", data: import('sql.js').SqlValue[][] }
type ResponseResults = { type: "RESULTS", data: Result[] }
type ResponseExported = { type: "EXPORTED", data: Uint8Array<ArrayBuffer> }

type ResponseMessage = ResponseInitialized | ResponseLoaded | ResponseTables | ResponseResults | ResponseExported

type Message = QueryMessage | ResponseMessage

type OkResult = {
    success: true,
    kind: "query" | "update",
    sql: string,
    schema: string[],
    values: any[][]
}

type ErrorResult = {
    success: false,
    error: any,
    sql: string
}

type Result = OkResult | ErrorResult

type LocalFetch = {
    json: () => Promise<any>,
    text: () => Promise<string>,
    arrayBuffer: () => Promise<Uint8Array>
}


type CustomFetch = LocalFetch | Response

declare module '*.wasm' {
    const content: string;
    export default content;
}

type DbSelectorBuiltinEntry =
    { id: string, selected?: "true" | "false" | boolean, value: string, "data-action": string }
    | { id: string, disabled: "disabled", selected?: "true" | "false" | boolean }

type DbSelectorEntry = [string, string, string, Uint8Array | ArrayBuffer]
