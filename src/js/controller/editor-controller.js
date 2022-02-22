import { setLanguage } from "../lang";

const TOOLBAR_PANEL_ID = "toolbar-panel"

/**
 * @param {String} sql
 */
function appendSemi(sql) {
    if (sql.match(/;\s*(--.*)?$/) != null) return sql;
    return sql + "\n;";
}


function saveAs(name, type, content) {
    const a = document.createElement("a");
    a.style.display = 'none';
    const url = window.URL.createObjectURL(new Blob([content], { type }))
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () {
        a.href = "";
        a.download = "";
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url)
    }, 0)
}


export class EditorController {

    constructor(model, editor, tableListView, outputView) {
        this.model = model
        this.editor = editor;
        this.tableListView = tableListView;
        this.outputView = outputView;
        this.toolBarDom = document.getElementById(TOOLBAR_PANEL_ID);
        this.toolBarHandler = null;
        this.keyHandler = null;
        this.outputClickHandler = null;
    }

    async executeAction() {
        const session = this.editor.getSession();
        const sql = session.getValue();
        const results = await this.model.evalSQL(sql);
        const status = this.outputView.appendResults(results);
        if (status.hasError) {
            alert(status.error);
            session.setValue(status.sql)
        } else {
            session.setValue("");
        }
        if (status.hasUpdate) {
            const tables = await this.model.tables();
            this.tableListView.setTables(tables);
        }
        setLanguage();
    }

    setLanguageAction(lang) {
        setLanguage(lang);
    }

    async exportDbAction() {
        const data = await this.model.export();
        saveAs("sqlite.db", "application/x-sqlite3", data);
    }

    exportHistoryAction() {
        let sql = "";
        for (const s of this.model.history) {
            sql += appendSemi(s) + "\n";
            console.log(s);
        }
        saveAs("code.sql", "application/sql", sql);
    }

    registerToolbar() {
        if (this.toolBarHandler != null) return;
        this.toolBarDom.addEventListener("click", this.toolBarHandler =
            (ev) => {
                const elem = ev.target;
                if ('action' in elem.dataset) {
                    console.log(elem.dataset.action);
                    this[elem.dataset.action](elem.dataset.arg);
                }
            });
    }

    unregisterToolBar() {
        if (this.toolBarHandler == null) return;
        this.toolBarDom.removeEventListener("click", this.toolBarHandler);
        this.toolBarHandler = null;
    }

    registerKey() {
        if (this.keyHandler != null) return;
        window.addEventListener("keypress", this.keyHandler = (ev) => {
            if (ev.key == "Enter" && ev.shiftKey) {
                ev.preventDefault();
                this.executeAction();
            }
        });
    }
    unregisterKey() {
        if (this.keyHandler == null) return;
        window.removeEventListener("keypress", this.keyHandler);
        this.keyHandler = null;
    }

    registerOutput() {
        if (this.outputClickHandler == null) {
            this.outputView.dom.addEventListener("click", this.outputClickHandler =
                (ev) => {
                    if (ev.target.classList.contains('sql-code')) {
                        const session = this.editor.getSession();
                        session.setValue(ev.target.innerText);
                        if (ev.ctrlKey) {
                            this.executeAction();
                        }
                    }
                }
            );
        }
    }

    unregisterOutput() {
        if (this.outputClickHandler != null) {
            this.outputView.dom.removeEventListener("click", this.outputHandler);
        }

    }

    register() {
        this.registerToolbar();
        this.registerKey();
        this.registerOutput();
    }
    unregister() {
        this.unregisterToolBar();
        this.unregisterKey();
        this.unregisterOutput();
    }
}