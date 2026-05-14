type InitMessage = { type: "INIT" }
type LoadMessage = { type: "LOAD", data: Uint8Array<ArrayBuffer> }
type LoadedMessage = { type: "LOADED" }
type TablesMessage = { type: "TABLES", data: import('sql.js').SqlValue[][] }
type ExecuteMessage = { type: "EXECUTE", data: string }
type ResultsMessage = { type: "RESULTS", data: Result[] }
type GetTablesMessage = { type: "GET-TABLES" }
type InterruptMessage = { type: "INTERRUPT" }
type ExportMessage = { type: "EXPORT" }
type ExportedMessage = { type: "EXPORTED", data: Uint8Array<ArrayBuffer> }


type Message = InitMessage
    | LoadMessage
    | LoadedMessage
    | TablesMessage
    | ExecuteMessage
    | ResultsMessage
    | GetTablesMessage
    | InterruptMessage
    | ExportMessage
    | ExportedMessage


type MessageType = Message["type"]


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
