import { setLanguage } from "../lang";

const TOOLBAR_PANEL_ID = "toolbar-panel"
const PLAY_BUTTON_ID = "execute-button"
const STOP_BUTTON_ID = "stop-button"
const RESIZE_PANEL_ID = "resize-panel"
const EDITOR_PANEL_ID = "editor-panel"

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
        this.playButton = document.getElementById(PLAY_BUTTON_ID);
        this.stopButton = document.getElementById(STOP_BUTTON_ID);
        this.resizePanel = document.getElementById(RESIZE_PANEL_ID);
        this.editorPanel = document.getElementById(EDITOR_PANEL_ID);
        this.stopButton.disabled = true;
        this.toolBarHandler = null;
        this.keyHandler = null;
        this.outputClickHandler = null;
        this.resizeHandler = null;
    }

    toggleButtons() {
        this.stopButton.disabled = !this.stopButton.disabled;
        this.playButton.disabled = !this.stopButton.disabled;
    }
    async updateTables() {
        const tables = await this.model.tables();
        this.tableListView.setTables(tables);
        setLanguage();
    }
    stopAction () {
        this.model.interrupt();
    }
    async executeAction() {
        this.toggleButtons();
        const session = this.editor.getSession();
        const sql = session.getValue();
        const results = await this.model.evalSQL(sql);
        this.toggleButtons();
        const status = this.outputView.appendResults(results);
        if (status.hasError) {
            if (status.error != "#INTERRUPT#") alert(status.error);
            session.setValue(status.sql)
        } else {
            session.setValue("");
        }

        if (status.hasUpdate) {
            this.updateTables();
        } else {
            setLanguage();
        }
    }
    async clearEditorAction() {
        const session = this.editor.getSession();
        if (session.getValue().trim().length > 0) {
            if (!window.confirm(document.getElementById("confirm-dialog-message").innerHTML)) return;
        }
        session.setValue("");
    }

    async clearOutputAction() {
        this.outputView.clear();
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
        }
        saveAs("code.sql", "application/sql", sql);
    }

    registerToolbar() {
        if (this.toolBarHandler != null) return;
        this.toolBarDom.addEventListener("click", this.toolBarHandler =
            (ev) => {
                for (const elem of [ev.target, ev.target.parentNode]) {
                    if ('action' in elem.dataset) {
                        this[elem.dataset.action](elem.dataset.arg);
                        break;
                    }
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
                    else {
                        for (const elem of [ev.target, ev.target.parentNode]) {
                            if ('action' in elem.dataset) {
                                this[elem.dataset.action](elem.dataset.arg);
                                break;
                            }
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

    registerResize () {
        if (this.resizeHandler == null) {
            let initY = -1;
            let initHeight = -1;
            this.resizeHandler = {}
            this.resizeHandler["mousedown"] = (e) => {
                if (e.target != this.resizePanel) return;
                initY = e.screenY;
                initHeight = this.editorPanel.offsetHeight;
            };
            this.resizeHandler["mouseup"] = (e) => {
                if (initY == -1) return;
                initY = -1;
                initHeight = -1;
            }
            this.resizeHandler["mousemove"] = (e) => {
                if (initY == -1) return;
                let delta = initY - e.screenY;
                this.editorPanel.style.height = (initHeight - delta) + "px";
            };
            for(let evname of Object.keys(this.resizeHandler)) {
                document.addEventListener(evname, this.resizeHandler[evname]);
            }
        }
    }
    unregisterResize() {
        if (this.resizeHandler != null) {
            for(let evname of Object.keys(this.resizeHandler)) {
                document.removeEventListener(evname, this.resizeHandler[evname]);
            }
        }
    }
    register() {
        this.registerToolbar();
        this.registerKey();
        this.registerOutput();
        this.registerResize();
        
    }

    unregister() {
        this.unregisterToolBar();
        this.unregisterKey();
        this.unregisterOutput();
        this.unregisterResize();
    }
}