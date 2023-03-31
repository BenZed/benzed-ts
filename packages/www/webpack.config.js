
/* eslint-disable 
    @typescript-eslint/no-var-requires
*/

/* REQUIRES */

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { EnvironmentPlugin, ProgressPlugin } = require('webpack')
const path = require('path')

/* CONSTANTS */

const WEBPACK_DEV_SERVER_PORT = 4000 + 500

const ENV = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
}

const OUTPUT = path.resolve(__dirname, 'public')
const ENTRY = path.resolve(__dirname, 'src/client/index.tsx')
const TEMPLATE = path.resolve(__dirname, 'src/client/assets/index.html')
const MONO_REPO_NODE_MODULES = path.resolve(__dirname, '../../node_modules')

/* EXPORTS */

module.exports = {

    mode: ENV.NODE_ENV,

    entry: ENTRY,

    output: {
        filename: 'bz-[contenthash].js',
        path: OUTPUT,
        publicPath: '/'
    },

    devServer: {
        compress: true,
        host: '0.0.0.0',
        port: WEBPACK_DEV_SERVER_PORT,
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true
        }
    },
    devtool: 'inline-source-map',

    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: {
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            target: 'es6',
                            module: 'CommonJS'
                        }
                    }
                },
                exclude: /node_modules/,

            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ],
    },

    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            // Prevent multiple-react-versions error (mind you, I still don't
            // understand why it's happening. This is the location react should
            // be resolving from, anyway)
            'react': path.join(MONO_REPO_NODE_MODULES, 'react'),
            'react-dom': path.join(MONO_REPO_NODE_MODULES, 'react-dom'),

            // Prevent app-client errors
            'koa': false,
            'koa-body': false,
            'util': false,
            'http': false,
            'path': false,
            'fs': false,
            'stream': false,
            'zlib': false,
            'os': false,
            'crypto': false,
            'querystring': false,
            'url': false,
            'net': false,
            'assert': false,
            'async_hooks': false,
        }
    },

    plugins: [
        new ProgressPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'BenZed',
            template: TEMPLATE,
            inject: 'head'
        }),
        new EnvironmentPlugin(ENV)
    ]

}