const DOM_ID: string = "table-panel";


export class TableListView {

    private static instance: TableListView;
    static getInstance(): TableListView {
        return this.instance ??= new this();
    }


    private tables: string[];
    private dom: HTMLDivElement;

    constructor() {
        this.tables = [];
        this.dom = document.getElementById(DOM_ID) as HTMLDivElement;
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)
    }

    setTables(tables: string[]): void {
        this.tables = tables;
        this.render();
    }

    private render(): void {
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
                <li><a class='table-drop-link'
                       href='javascript:;' data-name='${name}'
                       data-action='DROP'></a></li>
            </ul>`

        }
    }
}
