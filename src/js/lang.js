"use strict";
export const LANGUAGES = ["EN", "FR"]

const STR = [
    [[],{}],

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
    [["#clear-editor-button"], {
        "title": {
            "EN" : "Clear editor",
            "FR" : "Effacer l'éditeur"
        }
    }],
    [["#clear-output-button"], {
        "title": {
            "EN" : "Clear output",
            "FR" : "Effacer la sortie"
        }
    }],
    [["#resize-panel"], {
        "title" : {
            "EN" : "Drag to resize",
            "FR" : "Redimentionner"
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
    [[".table-drop-link"], {
        "innerHTML": {
            "EN": "DROP",
            "FR": "SUPPRIMER"
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
    [["#db-selector-text"], {
        "innerHTML": {
            "EN" : "Choose a database…",
            "FR" : "Choisir une base de données…"
        }
    }],
    [["#db-selector-new"], {
        "innerHTML": {
            "EN" : "&#x2B50; New database",
            "FR" : "&#x2B50; Nouvelle base de données"
        }
    }],
    [["#db-selector-from-db-file"], {
        "innerHTML": {
            "EN" : "&#x1F4D9; load a SQLite Database",
            "FR" : "&#x1F4D9; charger une base SQLite"
        }
    }],
    [["#db-selector-from-sql-file"], {
        "innerHTML": {
            "EN" : "&#x1F4C4; load a SQL file",
            "FR" : "&#x1F4C4; charger un fichier SQL"
        }
    }],
    [["#db-selector-example-label"], {
        "innerHTML": {
            "EN" : "Builtin examples…",
            "FR" : "Exemples pré-définis…"
        }
    }],
    [["#confirm-dialog-message"], {
        "innerHTML": {
            "EN" : "Do you wish to clear the current editor?",
            "FR" : "Voulez vous effacer l'éditeur ?"
        }
    }],
    [["#github-banner"], {
        "innerHTML" : {
            "EN" : "See on GitHub",
            "FR" : "Voir sur GitHub"
        }
    }]
];
let LANG = null;
(function () {
    let ln = "EN";
    if (navigator.languages && navigator.languages.length) {
        ln = navigator.languages[0];
    } else if (navigator.language) {
        ln = navigator.language;
    }
    ln = ln.split("-")[0].toLocaleUpperCase();
    if (LANGUAGES.indexOf(ln) < 0) ln = "EN";
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
setLanguage();
