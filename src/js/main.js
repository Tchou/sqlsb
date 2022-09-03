
"use strict";
import * as ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-xcode';
import { setLanguage } from './lang';
import { DbModel } from './model/db-model';
import * as RemoteExamples from './model/remote-examples'


import * as TableListView from './vue/table-list-view'
import * as OutputView from './vue/output-view'
import * as DbSelectorView from './vue/db-selector-view'

import { TableListController } from './controller/table-list-controller'
import { EditorController } from './controller/editor-controller'
import { DbSelectorController } from './controller/db-selector-conroller'

function init() {
    const editor = ace.edit('code-editor');
    editor.session.setMode('ace/mode/sql');
    editor.setTheme('ace/theme/xcode');


    const model = new DbModel();
    const remoteExamples = RemoteExamples.getInstance();
    Promise.all([model.load(),
    remoteExamples.load("db/")
    ]).then(() => {
        const dbSelectorView = DbSelectorView.getInstance();
        dbSelectorView.setEntries(remoteExamples.entries);
        const tableListView = TableListView.getInstance();
        const outputView = OutputView.getInstance();
        const paramLang = (new URLSearchParams(window.location.search)).get("lang");
        setLanguage(paramLang);
        const tableListController = new TableListController(model, outputView,tableListView);
        const editorController = new EditorController(model, editor, tableListView, outputView);
        const dbSelectorController = new DbSelectorController(remoteExamples, dbSelectorView, editorController);
        tableListController.register();
        editorController.register();
        dbSelectorController.register();
    });
}



window.addEventListener("DOMContentLoaded", init);
