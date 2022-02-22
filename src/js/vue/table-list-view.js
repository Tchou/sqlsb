const DOM_ID = "table-panel";


let instance = null;

class TableListView {

    constructor() {
        this.tables = [];
        this.dom = document.getElementById(DOM_ID);
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)
    }
    setTables(tables) {
        this.tables = tables;
        this.render();
    }
    render() {
        const ul = document.createElement("ul");
        this.dom.innerHTML = "";
        this.dom.appendChild(ul);
        for (const name of this.tables) {
            let li = document.createElement("li");
            ul.appendChild(li);
            li.innerHTML = `<span class='table-name'>${name}</span>
            <ul>
                <li><a class='table-schema-link'
                       href='javascript:;' data-name='${name}'
                       data-action='SCHEMA'></a></li>
                <li><a class='table-values-link'
                       href='javascript:;' data-name='${name}'
                       data-action='VALUES'></a></li>
                <li><a class='table-count-link'
                       href='javascript:;' data-name='${name}'
                       data-action='COUNT'></a></li>
            </ul>`

        }
    }
}

export function getInstance() {
    if (instance == null) {
        instance = new TableListView();
    }
    return instance;
}