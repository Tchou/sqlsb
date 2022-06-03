export class DbSelectorController {
    constructor(remoteExamples, dbSelectorView, editorController) {
        this.dbSelectorView = dbSelectorView;
        this.remoteExamples = remoteExamples;
        this.editorController = editorController;
        this.dbSelectorViewCallback = null;
    }

    async loadExampleAction(id) {
        for (let [file, _, sql, db] of this.remoteExamples.entries) {
            if (file == id) {
                await this.editorController.model.load(new Uint8Array(db));
                await this.editorController.updateTables();
                this.editorController.editor.getSession().setValue(sql);
                break;
            }
        }
    }
    register() {
        if (!this.dbSelectorViewCallback) {
            const select = this.dbSelectorView.select;
            select.addEventListener("change",
                this.dbSelectorViewCallback = (ev) => {
                    let opt = select.options[select.selectedIndex];
                    if (!opt) return;
                    if (opt.dataset.action) {
                        this[opt.dataset.action](opt.value);
                    }

                })
        }
    }
}