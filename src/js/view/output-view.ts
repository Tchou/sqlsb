const DOM_ID = "output-panel";


const appendRow = (table: HTMLTableElement, tag: "td" | "th", row: string[], pre: string): void => {
    const tr = document.createElement("tr");
    table.appendChild(tr);
    let td = document.createElement(tag);
    td.appendChild(document.createTextNode(pre));
    tr.appendChild(td);
    for (const v of row) {
        td = document.createElement(tag);
        td.appendChild(document.createTextNode(v));
        tr.appendChild(td);
    }
}
const renderResult = (result: OkResult, ol: HTMLOListElement): boolean => {
    let hasUpdate = false;
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.classList.add('sql-code');
    span.appendChild(document.createTextNode(result.sql.trim()));
    if (result.sql.indexOf('\n') >= 0) {
        span.classList.add('multiline');
    }
    li.appendChild(span);
    let output = document.createElement("span");
    output.classList.add("sql-result");
    li.appendChild(output);

    if (result.kind == "query") {
        output = document.createElement("div");
        const table_head = document.createElement("table") as HTMLTableElement;
        table_head.classList.add("table-head");
        const table_body = document.createElement("table") as HTMLTableElement;
        table_body.classList.add("table-body");
        output.appendChild(table_head);
        output.appendChild(table_body);
        appendRow(table_head, "th", result.schema, "");
        for (const [i, row] of result.values.entries()) {
            appendRow(table_body, "td", row, i.toString());
        }
        output.classList.add("sql-result");
        li.appendChild(output);
    } else {
        hasUpdate = true;
    }
    ol.appendChild(li);

    return hasUpdate;
}

export class OutputView {

    private static instance: OutputView;
    static getInstance(): OutputView {
        return this.instance ??= new this();
    }

    dom: HTMLDivElement

    constructor() {
        this.dom = document.getElementById(DOM_ID) as HTMLDivElement;
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)
    }

    clear(): void {
        let ol = this.dom.querySelector("ol");
        if (ol) {
            this.dom.removeChild(ol);
        }
    }

    appendResults(results: Result[]) {
        let ol = this.dom.querySelector("ol");
        if (!ol) {
            ol = document.createElement("ol");
            this.dom.appendChild(ol);
        }
        let status = {
            hasUpdate: false,
            hasError: false,
            sql: "",
            error: null

        }
        for (const result of results) {
            if (!result.success) {
                status.hasError = true;
                status.sql = result.sql;
                status.error = (result as ErrorResult).error;
                break;
            }
            status.hasUpdate = status.hasUpdate || renderResult((result as OkResult), ol);
        }
        this.dom.scrollTop = this.dom.scrollHeight;
        return status;
    }

}
