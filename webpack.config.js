const fs = require('fs');
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const basePath = path.join(__dirname, 'static');
const scriptsPath = path.join(basePath, 'scripts');
const stylesPath = path.join(basePath, 'styles');

const entryFiles = {};

for(let assetFile of fs.readdirSync(scriptsPath)) {
    if(!assetFile.includes('.js')) {
        entryFiles[`${assetFile.split('.')[0]}`] = `./static/scripts/${assetFile}`;
    }
}

for(let assetFile of fs.readdirSync(stylesPath)) {
    if(!assetFile.includes('.css')) {
        entryFiles[`${assetFile.split('.')[0]}`] = `./static/styles/${assetFile}`;
    }
}

module.exports = {
    entry: entryFiles,
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts'],
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: "styles/[name].css"
        })
    ],
    output: {
        filename: 'scripts/[name].js',
        path: basePath
    }
};