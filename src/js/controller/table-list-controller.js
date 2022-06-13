import { setLanguage } from "../lang";

const DOM_ID = "table-panel";

export class TableListController {

    constructor(model, outputView, tableListView) {

        this.callback = null;
        this.model = model;
        this.outputView = outputView;
        this.tableListView = tableListView;
        this.dom = document.getElementById(DOM_ID);
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)

    }


    register() {
        if (this.callback != null) return;
        this.dom.addEventListener("click", this.callback = async (ev) => {
            const elem = ev.target;
            if ('name' in elem.dataset && 'action' in elem.dataset) {
                const table = elem.dataset.name;
                let query = "";
                let update = false;
                switch (elem.dataset.action) {
                    case "SCHEMA":
                        query = `SELECT sql as SCHEMA
 FROM sqlite_schema
 WHERE type='table' AND name='${table}'`;
                        break;
                    case "COUNT":
                        query = `SELECT COUNT(*) as COUNT FROM ${table}`;
                        break;
                    case "DROP":
                        update = true;
                        query = `DROP TABLE ${table}`;
                        break;
                    case "VALUES":
                        query = `SELECT * FROM ${table}`;
                        break
                    default:
                        return;
                }
                const results = await this.model.evalSQL(query);
                this.outputView.appendResults(results);
                if (update) {
                    const tables = await this.model.tables();
                    this.tableListView.setTables(tables);
                    setLanguage();
                }

            }
        });

    }
    unregister() {
        if (!this.callbcak) return;
        this.dom.removeEventListener("click", this.callback);
        this.callback = null;
    }

}