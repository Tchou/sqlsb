import { DbModel } from "../model/db-model";
import { RemoteExamples } from "../model/remote-examples";
import { DbSelectorView } from "../view/db-selector-view"
import { EditorController } from "./editor-controller";

const CONFIRM_ELEMENT_ID = "confirm-load-message";
const FILE_SELECTOR_ID = "file-selector";

export class DbSelectorController {

    dbSelectorView: DbSelectorView;
    remoteExamples: RemoteExamples;
    editorController: EditorController;
    model: DbModel;
    dbSelectorViewCallback: (this: HTMLSelectElement, Event) => any = null;

    constructor(remoteExamples: RemoteExamples, model: DbModel, dbSelectorView: DbSelectorView, editorController: EditorController) {
        this.dbSelectorView = dbSelectorView;
        this.remoteExamples = remoteExamples;
        this.editorController = editorController;
        this.model = model;
        this.dbSelectorViewCallback = null;
    }

    loadFile(kind) {
        const that = this;
        return new Promise((resolve, reject) => {
            const fs = document.getElementById(FILE_SELECTOR_ID);
            fs.addEventListener("change", function cb(ev) {
                const fileList = (ev.target as HTMLInputElement).files;
                if (fileList.length >= 1) {
                    const file = fileList.item(0);
                    if (kind == "/DB/") {
                        file.arrayBuffer().then(buf =>
                            that.model.load(new Uint8Array(buf))
                                .then(() => {
                                    fs.removeEventListener("change", cb);
                                    resolve(null);
                                }));
                    } else {
                        file.text().then(txt => {
                            that.editorController.editor.getSession().setValue(txt);
                            fs.removeEventListener("change", cb);
                            resolve(null);
                        });
                    }
                } else {
                    fs.removeEventListener("change", cb);
                    resolve(null);
                }

            });
            fs.click();
        });

    }

    async resetView() {
        await this.editorController.updateTables();
        this.model.clearHistory();
        this.editorController.outputView.clear();
    }
    async loadFileAction(kind) {
        await this.loadFile(kind);
        await this.resetView();
        this.dbSelectorView.resetEntry();
    }

    async loadNewAction() {
        this.editorController.editor.getSession().setValue("");
        await this.model.load(new Uint8Array());
        await this.resetView();
        this.dbSelectorView.resetEntry();
    }

    async loadExampleAction(id: string) {
        for (const entry of this.remoteExamples.entries) {
            if (typeof entry == "string") continue;
            const [file, _, sql, db] = entry;
            if (file == id) {
                this.editorController.editor.getSession().setValue(sql);
                await this.model.load(new Uint8Array(db));
                await this.resetView();
                this.dbSelectorView.resetEntry();
                break;
            }
        }
    }
    register() {
        const that = this;
        if (!this.dbSelectorViewCallback) {
            const select = this.dbSelectorView.select;
            select.addEventListener("change",
                this.dbSelectorViewCallback = (ev) => {
                    let opt = select.options[select.selectedIndex];
                    if (!opt) return;
                    if (opt.dataset.action) {
                        if (!that.model.dirty ||
                            window.confirm(document.getElementById(CONFIRM_ELEMENT_ID).innerHTML)
                        ) {
                            this[opt.dataset.action](opt.value);
                        }
                    }

                })
        }
    }
}