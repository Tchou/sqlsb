/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/sql.js/dist/sql-asm.js":
/*!*********************************************!*\
  !*** ./node_modules/sql.js/dist/sql-asm.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/***/ }),

/***/ "./src/js/model/db-worker.js":
/*!***********************************!*\
  !*** ./src/js/model/db-worker.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var sql_js_dist_sql_asm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sql.js/dist/sql-asm */ \"./node_modules/sql.js/dist/sql-asm.js\");\n/* harmony import */ var sql_js_dist_sql_asm__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sql_js_dist_sql_asm__WEBPACK_IMPORTED_MODULE_0__);\n\n\n/**\n * @type {SQL.Database}\n */\nlet db = null;\nlet running = false;\n/**\n * @param {SQL.StatementIterator } it\n * @param {SQL.Statement} stmt\n*/\nfunction executeStatement(stmt) {\n\n    const sql = stmt.getSQL();\n    let next = stmt.step();\n    let schema = stmt.getColumnNames();\n    let values = [];\n    while (next) {\n        values.push(stmt.get());\n        next = stmt.step();\n    }\n    return {\n        success: true,\n        kind: schema.length == 0 ? \"update\" : \"query\",\n        sql,\n        schema,\n        values\n    };\n\n}\nfunction pause() {\n    return new Promise(requestAnimationFrame);\n}\n\nasync function runSQL(sql, noblock) {\n\n    const it = db.iterateStatements(sql);\n    const results = [];\n    let i = 0;\n    try {\n        for (const stmt of it) {\n            const res = executeStatement(stmt);\n            results.push(res);\n            if (!res.success) break;\n            if (!noblock && i++ % 5000 == 0) {\n                await pause();\n                if (!running) {\n                    throw { message: \"#INTERRUPT#\" }\n                }\n\n            }\n        }\n    } catch (e) {\n        results.push({\n            success: false,\n            error: e.message,\n            sql: it.getRemainingSQL()\n        });\n    }\n    return results;\n\n}\nsql_js_dist_sql_asm__WEBPACK_IMPORTED_MODULE_0___default()().then(SQL => {\n    self.addEventListener(\"message\", (ev) => {\n        const msg = ev.data;\n        switch (msg.type) {\n            case \"INIT\":\n                self.postMessage({ type: \"INIT\" });\n                break;\n\n            case \"LOAD\":\n                if (db != null) {\n                    db.close();\n                }\n                db = new SQL.Database(msg.data);\n                db.create_function(\"MOD\", (x, y) => x % y);\n                self.postMessage({ type: \"LOADED\" });\n                break;\n\n            case \"EXECUTE\":\n                running = true;\n                runSQL(msg.data).then((data) => {\n                    running = false;\n                    self.postMessage({ type: \"RESULTS\", data });\n                });\n                break;\n\n            case \"TABLES\":\n                running = true;\n                runSQL(\"SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;\", true)\n                    .then(res => {\n                        running = false;\n                        res = res[0];\n                        self.postMessage({ type: \"TABLES\", data: res.values });\n                    });\n                break;\n\n            case \"EXPORT\":\n                const array = db.export();\n                self.postMessage({ type: \"EXPORT\", data: array }, [array.buffer]);\n                break;\n\n            case \"INTERRUPT\":\n                running = false;\n                break;\n\n            default:\n\n        }\n\n    });\n});\n\n//# sourceURL=webpack://sqlsb/./src/js/model/db-worker.js?");

/***/ }),

/***/ "?8893":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://sqlsb/crypto_(ignored)?");

/***/ }),

/***/ "?5041":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://sqlsb/fs_(ignored)?");

/***/ }),

/***/ "?c8d5":
/*!**********************!*\
  !*** path (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://sqlsb/path_(ignored)?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/model/db-worker.js");
/******/ 	
/******/ })()
;