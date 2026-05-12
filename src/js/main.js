
"use strict";

import { setLanguage } from './lang';
import { DbModel } from './model/db-model';
import * as RemoteExamples from './model/remote-examples'


import * as TableListView from './vue/table-list-view'
import * as OutputView from './vue/output-view'
import * as DbSelectorView from './vue/db-selector-view'

import { TableListController } from './controller/table-list-controller'
import { EditorController } from './controller/editor-controller'
import { DbSelectorController } from './controller/db-selector-controller'

import * as config from "./config"


function init() {
    let theme = config.getOption("theme");
    if (theme != "dark") theme = "light";
    document.documentElement.setAttribute("class", theme);

    const model = new DbModel(globalThis.workerUrl);
    const remoteExamples = RemoteExamples.getInstance();
    Promise.all([model.load(),
    remoteExamples.load(globalThis.dbUrl)
    ]).then(() => {
        const dbSelectorView = DbSelectorView.getInstance();
        dbSelectorView.setEntries(remoteExamples.entries);
        const tableListView = TableListView.getInstance();
        const outputView = OutputView.getInstance();
        const paramLang = (new URLSearchParams(window.location.search)).get("lang");
        setLanguage(paramLang);
        const tableListController = new TableListController(model, outputView,tableListView);
        const editorController = new EditorController(model, tableListView, outputView);
        const dbSelectorController = new DbSelectorController(remoteExamples, dbSelectorView, editorController);
        tableListController.register();
        editorController.register();
        dbSelectorController.register();
    });
}



window.addEventListener("DOMContentLoaded", init);
