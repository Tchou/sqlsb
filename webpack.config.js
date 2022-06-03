const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        "main": './src/js/main.js',
        "db-worker": './src/js/model/db-worker.js'
    },
    output: {
        path: __dirname + "/dist",
        filename: '[name].js'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/css", to: "css/" },
                { from: "src/img", to: "img/" },
                { from: "src/db", to: "db/" },
                { from: "src/index.html", to: "index.html" },
                { from: "src/favicon.ico", to: "favicon.ico" }
            ],
        }),
    ],
    resolve: {
        fallback: {
            fs: false,
            path: false,
            crypto: false,
        }
    },
    performance: { hints: false }
}
