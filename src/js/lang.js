"use strict";
export const LANGUAGES = ["EN", "FR"]

const STR = [
    [["#execute-button"], {
        "title": {
            "EN": "Run [Shift-Enter]",
            "FR": "Exécuter [Maj-Entrée]"
        }
    }],
    [["#export-db-button"], {
        "title": {
            "EN": "Export Database in SQLite3 format",
            "FR": "Exporter la base de données au format SQLite3"
        }
    }],
    [["#export-history-button"], {
        "title": {
            "EN": "Export SQL Statement history",
            "FR": "Exporter l'historique de commandes SQL"
        }
    }],
    [["#page-title", "#title-tag"], {
        "innerHTML": {
            "EN": "SQL Sandbox",
            "FR": "Bac à sable SQL"
        }
    }],
    [[".table-values-link"], {
        "innerHTML": {
            "EN": "VALUES",
            "FR": "VALEURS"
        }
    }],
    [[".table-schema-link"], {
        "innerHTML": {
            "EN": "SCHEMA",
            "FR": "SCHÉMA"
        }
    }],
    [["#output-panel .sql-code"], {
        "title" : {
            "EN" : "Copy to editor [click]/Execute [Ctrl-click]",
            "FR" : "Copier dans l'éditeur [click]/Exécuter [Ctrl-clik]"
        }
    }],
    [[".table-count-link"], {
        "innerHTML": {
            "EN": "COUNT",
            "FR": "TAILLE"
        }
    }],
];
let LANG = null;
(function () {
    let ln = navigator.language || "en";
    ln = ln.split("-")[0].toLocaleUpperCase();
    LANG = ln;
})();


export function setLanguage(lang) {
    if (typeof lang === "undefined") {
        lang = LANG;
    } else {
        LANG = lang;
    }
    for (const [ids, msgs] of STR) {
        for (const id of ids) {
            for (const elem of document.querySelectorAll(id)) {
                for (const [att, txt] of Object.entries(msgs)) {
                    elem[att] = txt[lang]
                }
            }
        }
    }
}