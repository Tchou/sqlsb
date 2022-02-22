const DOM_ID = "output-panel";


let instance = null;
const appendRow = (table, tag, row, pre) => {
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
const renderResult = (result, ol) => {
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
        const table_head = document.createElement("table");
        table_head.classList.add("table-head");
        const table_body = document.createElement("table");
        table_body.classList.add("table-body");
        output.appendChild(table_head);
        output.appendChild(table_body);
        appendRow(table_head, "th", result.schema, "");
        for (const [i, row] of result.values.entries()) {
            appendRow(table_body, "td", row, i)
        }
        output.classList.add("sql-result");
        li.appendChild(output);
    } else {
        hasUpdate = true;
    }
    ol.appendChild(li);

    return hasUpdate;
}

class OutputView {

    constructor() {
        this.dom = document.getElementById(DOM_ID);
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)
    }

    appendResults(results) {
        console.log(results);
        let ol = this.dom.querySelector("ol");
        if (!ol) {
            ol = document.createElement("ol");
            this.dom.appendChild(ol);
        }
        let status = {
            hasUpdate: false,
            hasError: false
        }
        for (const result of results) {
            if (!result.success) {
                status.hasError = true;
                status.sql = result.sql;
                status.error = result.error;
                break;
            }
            status.hasUpdate |= renderResult(result, ol);
        }
        this.dom.scrollTop = this.dom.scrollHeight;
        return status;
    }

}

export function getInstance() {
    if (instance == null) {
        instance = new OutputView();
    }
    return instance;
}