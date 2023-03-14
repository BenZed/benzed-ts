
/* eslint-disable 
    @typescript-eslint/no-var-requires
*/

/* REQUIRES */

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { EnvironmentPlugin } = require('webpack')
const path = require('path')

const styledComponentsTransformer = require('typescript-plugin-styled-components').default()

/* CONSTANTS */

const WEBPACK_DEV_SERVER_PORT = 3000 + 500

const ENV = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
}

const OUTPUT = path.resolve(__dirname, 'public')

const ENTRY = path.resolve(__dirname, 'src/client/index.tsx')

const TEMPLATE = path.resolve(__dirname, 'src/client/index.html')

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
        port: WEBPACK_DEV_SERVER_PORT,
        historyApiFallback: true,
        host: '0.0.0.0',
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
                        getCustomTransformers: () => ({
                            before: [styledComponentsTransformer]
                        })
                    }
                },
                exclude: /node_modules/,

            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(svg|png|jpe?g|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name]@[contenthash].[ext]'
                    }
                }
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
        fallback: {
            util: false
        }
    },

    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'BenZed',
            template: TEMPLATE,
            inject: 'head'
        }),
        new EnvironmentPlugin(ENV)
    ]

}