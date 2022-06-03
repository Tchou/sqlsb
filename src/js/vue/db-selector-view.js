const DOM_ID = "db-selector-panel";


let instance = null;
const BUILTIN_ENTRIES = [{
    id: "db-selector-text", selected: "true", disabled: "disabled"
},
{ id: "db-selector-from-db-file", value: "/DB/" },
{ id: "db-selector-from-sql-file", value: "/SQL/" },
{ id: "db-selector-example-label", disabled: "disabled" },
];

class DbSelectorView {
    constructor() {
        this.dom = document.getElementById(DOM_ID);
        if (this.dom == null) throw new Error(`{missing element '#${DOM_ID}}'`)
        this.entries = [];
        const select = document.createElement("select");
        this.dom.appendChild(select);
        select.id = "db-selector";
        select.dataset.action = "selectAction";
        this.builtins = {};
        for (let entry of BUILTIN_ENTRIES) {
            this.builtins[entry.id] = true;
            const o = document.createElement("option");
            for (let p in entry) {
                o[p] = entry[p];
            }
            select.appendChild(o);
        }
        this.select = select;
    }

    setEntries(entries) {
        this.entries = entries;
        this.render();
    }

    selectByName(n) {
        for(let opt of this.select.options) {
            if (opt.textContent == n) {
                opt.selected = "selected";
                break;
            }
        }
    }

    render() {
        for (let opt of this.select.options) {
            if (this.builtins[opt.id]) continue;
            this.select.removeChild(opt);
        }
        for (let entry of this.entries) {
            const opt = document.createElement("option");
            opt.value = entry[0];
            opt.text = entry[1];
            opt.dataset.action = "loadExampleAction";
            this.select.appendChild(opt);
        }


    }

}
export function getInstance() {
    if (instance == null) {
        instance = new DbSelectorView();
    }
    return instance;
}