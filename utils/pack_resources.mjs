import * as fs from 'fs';
import * as path from 'path';

const MIME_TYPES = {
    ".svg" : "image/svg+xml",
    ".ico" : "image/x-icon",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".webp" : "image/webp",
    ".jpg" : "image/jpeg",
    ".jpeg" : "image/jpeg"
};

function imageSrcToBase64 (p) {
    const content = fs.readFileSync(p);
    const mimeType = MIME_TYPES[path.extname(p).toLowerCase()];
    if (!mimeType) return "";
    return "data:" + mimeType +";base64," + content.toString('base64');
}

function replaceByContent(fpath, re, fmatch, frest) {
    let txt = fs.readFileSync(fpath).toString();
    re = new RegExp(re, "gdm");
    let match = null;
    let lastIdx = 0;
    while ((match = re.exec(txt)) != null) {
        let startMatch = match.indices[0][0];
        frest(txt.substring(lastIdx, startMatch));
        fmatch(fpath, re, match);
        lastIdx = match.indices[0][1];
    }
    frest(txt.substring(lastIdx));
    return;
}

function inlineCSS (file, frest) {
    const re = "@import ['\"]\([^'\"]*\)['\"] *;";
    replaceByContent(file, re, function loop (fpath, re, match) {
        replaceByContent(path.join(path.dirname(fpath),match[1]), re, loop, frest);
    }, frest);
}
function inlineCSSinHTML(file, frest) {
    const re = `<link rel="stylesheet" type="text/css" href="\([^'"]*\)">`;
    replaceByContent(file, re, function (fpath, re, match) {
        frest("<style>");
        inlineCSS(path.join(path.dirname(fpath),match[1]), frest);
        frest("</style>");
    }, frest);
}
function inlineJsInHTML(file, frest) {
    const re = `<script src="\([^"]*[.]js\)"> *</script>`;
    replaceByContent(file, re, function (fpath, re, match) {
        frest("<script>");
        frest(fs.readFileSync(path.join(path.dirname(fpath),match[1])));
        frest("</script>");
    }, frest);
}
function inlineImgInHTML(file, frest) {
    const re = `<img *src=['"]\([^'"]*\)['"]`;
    replaceByContent(file, re, function (fpath, re, match) {
        let imgFile = path.join(path.dirname(fpath),match[1]);
        let url = imageSrcToBase64(imgFile);
        frest(`<img src='${url}'`);
    }, frest);
}
function inlineIcoInHTML(file, frest) {
    const re = `<link *rel="icon" *type="image/x-icon" *href=['"]\([^"']*\)['"]>`;
    replaceByContent(file, re, function (fpath, re, match) {
        let imgFile = path.join(path.dirname(fpath),match[1]);
        let url = imageSrcToBase64(imgFile);
        frest(`<link rel="icon" type="image/x-icon" href='${url}' >`);
    }, frest);
}

function inlineDbInHTML (file, frest) {
    const re = `<script> */[*] *INLINE *[']\([^']*.json\)['] *[*]/ *</script>`;
    replaceByContent(file, re, function(fpath, re, match) {
        let indexFile = path.join(path.dirname(fpath), match[1]);
        let txt = fs.readFileSync(indexFile, {encoding:'utf-8'});
        frest(`<script>
globalThis.DATA = {};
globalThis.DATA["${path.basename(match[1])}"] = ${JSON.stringify(txt)};\n`);
        const json = JSON.parse(txt);
        for(let e of json) {
            if (e.hasOwnProperty("db_file")) {
                let dbFile = path.join(path.dirname(indexFile), e.db_file);
                let data = fs.readFileSync(dbFile);
                frest(`globalThis.DATA["${e.db_file}"] = '${data.toString('base64')}';\n`)
            };
            if (e.hasOwnProperty("sql_file")) {
                let sqlFile = path.join(path.dirname(indexFile), e.sql_file);
                let data = fs.readFileSync(sqlFile);
                frest(`globalThis.DATA["${e.sql_file}"] = ${JSON.stringify(data.toString())};\n`)
            };
    }
    frest("</script>\n");
    }, frest);
}
function inlineWorkerInHTML (file, frest) {
    const re = `<script> */[*] *INLINE *[']\(db-worker.js\)['] *[*]/ *</script>`;
    replaceByContent(file, re, function(fpath, re, match) {
        let jsFile = path.join(path.dirname(fpath), match[1]);
        let txt = fs.readFileSync(jsFile, {encoding:'utf-8'});
        frest(`<script>
globalThis.DATA["${match[1]}"] = ${JSON.stringify(txt)};\n</script>\n`);
    }, frest);
}

function main () {
    if (process.argv.length != 4) {
        process.stderr.write(`usage ${process.argv[0]} ${process.argv[1]} <input> <output>\n`);
        process.exit(1);
    }
    let input = process.argv[2];
    try {
        let todo = [inlineCSSinHTML,
                    inlineImgInHTML,
                    inlineIcoInHTML,
                    inlineDbInHTML,
                    inlineJsInHTML,
                    inlineWorkerInHTML];
        let baseDir = path.dirname(input);
        let tmpOutput = null;
        for(let i = 0; i < todo.length; i++) {
            const exec = todo[i];
            console.log(exec.name);
            tmpOutput = path.join(baseDir, "__tmp" + i + ".html"); 
            let fd = fs.openSync(tmpOutput, "w");
            let frest = (s) => fs.writeFileSync(fd, s);
            exec(input, frest);
            fs.closeSync(fd);
            if (i > 0) fs.rmSync(input);
            input = tmpOutput;
        }
        fs.copyFileSync(tmpOutput, process.argv[3]);
        if (tmpOutput) fs.rmSync(tmpOutput);
    } catch (e) {
        process.stderr.write(e.toString() + "\n");
        process.exit(2);
    }
}

main ();