export class DbSelectorController {
    constructor(remoteExamples, dbSelectorView, editorController) {
        this.dbSelectorView = dbSelectorView;
        this.remoteExamples = remoteExamples;
        this.editorController = editorController;
        this.dbSelectorViewCallback = null;
    }

    loadFile(kind) {
        const that = this;
        return new Promise((resolve, reject) => {
            const fs = document.getElementById("file-selector");
            fs.addEventListener("change", function cb(ev) {
                const fileList = ev.target.files;
                if (fileList.length >= 1) {
                    const file = fileList.item(0);
                    if (kind == "/DB/") {
                        file.arrayBuffer().then(buf =>
                            that.editorController.model.load(new Uint8Array(buf))
                                .then(() => {
                                    fs.removeEventListener("change", cb);
                                    resolve();
                                }));
                    } else {
                        file.text().then(txt => {
                            that.editorController.editor.getSession().setValue(txt);
                            fs.removeEventListener("change", cb);
                            resolve();
                        });
                    }
                } else {
                    fs.removeEventListener("change", cb);
                    resolve();
                }

            });
            fs.click();
        });

    }
    async loadFileAction(kind) {
        this.dbSelectorView.resetEntry();
        await this.loadFile(kind);     
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