const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        "main": './src/js/main.ts',
        "db-worker": './src/js/model/db-worker.ts'
    },
    output: {
        path: __dirname + "/dist",
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /sql-wasm-browser\.wasm$/,
            type: 'asset/inline'
        },
        {
            test: /\.tsx?$/,
            use: {
                loader: 'ts-loader'
            },
            exclude: [/node_modules/, /\.d\.ts$/]
        }]
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
        extensions: ['.ts', '.js'],
        alias: {
            'sql.js$': 'sql.js/dist/sql-wasm-browser.js'
        },
        fallback: {
            fs: false,
            path: false,
            crypto: false,
        }
    },
    performance: { hints: false }
}