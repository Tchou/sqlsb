
"use strict";
import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-xcode';
import { setLanguage } from './lang';
import { DbModel } from './model/db-model';
import * as TableListView from './vue/table-list-view'
import * as OutputView from './vue/output-view'
import { TableListController } from './controller/table-list-controller'
import { EditorController } from './controller/editor-controller'

function init() {
    const editor = ace.edit('code-editor');
    editor.session.setMode('ace/mode/sql');
    editor.setTheme('ace/theme/xcode');

    setLanguage();

    const model = new DbModel();
    model.load().then(() => {
        const tableListView = TableListView.getInstance();
        const outputView = OutputView.getInstance();
        const tableListController = new TableListController(model, outputView);
        const editorController = new EditorController(model, editor, tableListView, outputView);
        tableListController.register();
        editorController.register();
    });
}



window.addEventListener("DOMContentLoaded", init);
