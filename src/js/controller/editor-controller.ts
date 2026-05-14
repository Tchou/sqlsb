import { setLanguage } from "../lang";
import { getOption, setOption } from "../config";

import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/theme-vibrant_ink';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/mode-pgsql';

import { DbModel } from "../model/db-model";

import { TableListView } from "../view/table-list-view";
import { OutputView } from "../view/output-view";

const TOOLBAR_PANEL_ID = "toolbar-panel";
const PLAY_BUTTON_ID = "execute-button";
const STOP_BUTTON_ID = "stop-button";
const CENTER_RESIZE_PANEL = "center-resize-panel";
const LEFT_RESIZE_PANEL = "left-resize-panel";
const EDITOR_PANEL_ID = "editor-panel";
const MAIN_PANEL_ID = "main-panel";
const THEME_BUTTON_ID = "theme-button";
const EDITOR_ELEMENT_ID = "code-editor";


const THEME_LIGHT = "ace/theme/xcode";
const THEME_DARK = "ace/theme/vibrant_ink";

function appendSemi(sql: string): string {
    if (sql.match(/;\s*(--.*)?$/) != null) return sql;
    return sql + "\n;";
}


function saveAs(name: string, type, content: BlobPart): void {
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
function getButton(id: string): HTMLButtonElement {
    return document.getElementById(id) as HTMLButtonElement;
}
function getDiv(id: string): HTMLDivElement {
    return document.getElementById(id) as HTMLDivElement;
}

export class EditorController {

    editor: ace;
    model: DbModel;
    tableListView: TableListView;
    outputView: OutputView;
    toolBarDom: HTMLDivElement;
    playButton: HTMLButtonElement;
    stopButton: HTMLButtonElement;
    themeButton: HTMLButtonElement;
    centerResizePanel: HTMLDivElement;
    leftResizePanel: HTMLDivElement;
    editorPanel: HTMLDivElement;
    mainPanel: HTMLDivElement;
    colorScheme: HTMLElement;
    toolBarHandler: (this: HTMLDivElement, ev: Event) => any;
    keyHandler: (this: HTMLDivElement, ev: Event) => any;
    outputClickHandler: (this: HTMLDivElement, ev: Event) => any;
    resizeHandler: { [key: string]: (this: HTMLDivElement, ev: MouseEvent) => any };
    historyPosition = -1;


    constructor(model, tableListView, outputView: OutputView) {
        this.model = model
        this.editor = ace.edit(EDITOR_ELEMENT_ID);
        this.editor.session.setMode('ace/mode/pgsql');

        this.tableListView = tableListView;
        this.outputView = outputView;
        this.toolBarDom = getDiv(TOOLBAR_PANEL_ID);
        this.playButton = getButton(PLAY_BUTTON_ID);
        this.stopButton = getButton(STOP_BUTTON_ID);
        this.themeButton = getButton(THEME_BUTTON_ID);
        this.centerResizePanel = getDiv(CENTER_RESIZE_PANEL);
        this.leftResizePanel = getDiv(LEFT_RESIZE_PANEL);
        this.editorPanel = getDiv(EDITOR_PANEL_ID);
        this.mainPanel = getDiv(MAIN_PANEL_ID);
        this.colorScheme = document.documentElement;
        this.stopButton.disabled = true;
        this.toolBarHandler = null;
        this.keyHandler = null;
        this.outputClickHandler = null;
        this.resizeHandler = null;
        this.historyPosition = -1;
        if (getOption("theme") == "dark") {
            this.setTheme("dark");
        } else {
            this.setTheme("light");
        }
    }

    setTheme(t: "light" | "dark"): void {
        switch (t.toLocaleLowerCase()) {
            case "light":
                this.colorScheme.classList.remove("dark");
                this.colorScheme.classList.add("light");
                this.editor.setTheme(THEME_LIGHT);
                setOption("theme", "light");
                break;
            case "dark":
                this.colorScheme.classList.remove("light");
                this.colorScheme.classList.add("dark");
                this.editor.setTheme(THEME_DARK);
                setOption("theme", "dark");
                break
        }
    }

    toggleTheme(): void {
        const isLight = this.colorScheme.classList.contains("light");
        if (isLight) {
            this.setTheme("dark")
        } else {
            this.setTheme("light")
        }
    }

    toggleButtons(): void {
        this.stopButton.disabled = !this.stopButton.disabled;
        this.playButton.disabled = !this.stopButton.disabled;
    }
    async updateTables(): Promise<void> {
        const tables = await this.model.tables();
        this.tableListView.setTables(tables);
        setLanguage();
    }

    stopAction(): void {
        this.model.interrupt();
    }

    async executeAction(): Promise<void> {
        this.toggleButtons();
        this.historyPosition = -1;
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
        this.editor.focus();
    }

    async clearEditorAction(): Promise<void> {
        const session = this.editor.getSession();
        if (session.getValue().trim().length > 0) {
            if (!window.confirm(document.getElementById("confirm-dialog-message").innerHTML)) return;
        }
        session.setValue("");
        this.historyPosition = -1;
        this.editor.focus();
    }

    async clearOutputAction(): Promise<void> {
        this.outputView.clear();
    }


    setLanguageAction(lang?: string): void {
        setLanguage(lang);
    }

    async exportDbAction(): Promise<void> {
        const data = await this.model.export();
        saveAs("sqlite.db", "application/x-sqlite3", data);
    }

    exportHistoryAction(): void {
        let sql = "";
        for (const s of this.model.history) {
            sql += appendSemi(s) + "\n";
        }
        saveAs("code.sql", "application/sql", sql);
    }

    registerToolbar(): void {
        if (this.toolBarHandler != null) return;
        this.toolBarDom.addEventListener("click", this.toolBarHandler =
            (ev) => {
                const target = ev.target as HTMLDivElement;
                for (const elem of [target, target.parentNode as HTMLElement]) {
                    if ('action' in elem.dataset) {
                        this[elem.dataset.action](elem.dataset.arg);
                        break;
                    }
                }
            });
    }

    unregisterToolBar(): void {
        if (this.toolBarHandler == null) return;
        this.toolBarDom.removeEventListener("click", this.toolBarHandler);
        this.toolBarHandler = null;
    }

    navigateHistory(dir: 1 | -1) {
        const history = Array.from(this.model.history);
        if (history.length == 0) return;
        const session = this.editor.getSession();
        if (this.historyPosition < 0) {
            if (session.getValue() == "") {
                this.historyPosition = history.length;
            } else {
                return;
            }
        } else {
            if (history[this.historyPosition] != session.getValue()) return;
        };
        const newPosition = this.historyPosition + dir;
        if (newPosition < 0 || newPosition >= history.length) {
            return;
        }
        const text = history[newPosition];
        session.setValue(text);
        this.historyPosition = newPosition;
    }



    registerKey() {
        if (this.keyHandler != null) return;
        window.document.body.addEventListener("keydown", this.keyHandler = (ev: KeyboardEvent) => {
            if (ev.key == "Enter" && ev.shiftKey) {
                this.executeAction();
                ev.preventDefault();
                ev.stopPropagation();
            } else if (ev.key == "ArrowUp" && ev.shiftKey && ev.ctrlKey) {
                this.navigateHistory(-1);
                ev.preventDefault();
                ev.stopPropagation();
            } else if (ev.key == "ArrowDown" && ev.shiftKey && ev.ctrlKey) {
                this.navigateHistory(1);
                ev.preventDefault();
                ev.stopPropagation();
            }
        }, true);
    }

    unregisterKey() {
        if (this.keyHandler == null) return;
        window.removeEventListener("keypress", this.keyHandler);
        this.keyHandler = null;

    }

    registerOutput() {
        if (this.outputClickHandler == null) {
            this.outputView.dom.addEventListener("click", this.outputClickHandler =
                (ev: MouseEvent) => {
                    const target = ev.target as HTMLElement;
                    if (target.classList.contains('sql-code')) {
                        const session = this.editor.getSession();
                        session.setValue(target.innerText);
                        if (ev.ctrlKey) {
                            this.executeAction();
                        }
                    }
                    else {
                        for (const elem of [target, target.parentNode as HTMLElement]) {
                            if ('action' in elem.dataset) {
                                this[elem.dataset.action](elem.dataset.arg);
                                break;
                            }
                        }
                    }
                    this.editor.focus();
                }
            );
        }
    }

    unregisterOutput(): void {
        if (this.outputClickHandler != null) {
            this.outputView.dom.removeEventListener("click", this.outputClickHandler);
        }

    }

    registerResize() {
        if (this.resizeHandler == null) {
            let initCoord = -1;
            let initSize = -1;
            let direction = 0; //1 vertical 2 horizontal
            this.resizeHandler = {}
            this.resizeHandler["mousedown"] = (e) => {
                if (e.target == this.centerResizePanel) {
                    initCoord = e.screenY;
                    initSize = this.editorPanel.offsetHeight;
                    direction = 1;
                } else if (e.target == this.leftResizePanel) {
                    initCoord = e.screenX;
                    initSize = this.mainPanel.offsetWidth;
                    direction = 2;
                }
            };
            this.resizeHandler["mouseup"] = (e) => {
                initCoord = -1;
                initSize = -1;
                direction = 0;
            }
            this.resizeHandler["mousemove"] = (e) => {
                let delta;
                if (direction == 1) {
                    delta = initCoord - e.screenY;
                    this.editorPanel.style.height = (initSize - delta) + "px";
                } else if (direction == 2) {
                    delta = e.screenX - initCoord;
                    this.mainPanel.style.width = (initSize - delta) + "px";
                }
            };
            for (let evname of Object.keys(this.resizeHandler)) {
                document.addEventListener(evname, this.resizeHandler[evname]);
            }
        }
    }
    unregisterResize() {
        if (this.resizeHandler != null) {
            for (let evname of Object.keys(this.resizeHandler)) {
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