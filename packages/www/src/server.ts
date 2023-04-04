import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import Koa, { Middleware } from 'koa'
import serve from 'koa-static'

import path from 'path'

import { createStylesServer, ServerStyles } from '@mantine/ssr'
import { Logger } from '@benzed/logger'
import fs from '@benzed/fs'

import { Website } from './client/components/website'

//// Constants ////

const PUBLIC = path.resolve(__dirname, '../public')

//// Middleware ////

const servePublic = (): Middleware => serve(PUBLIC)

const renderClient = (): Middleware => {

    const HTML_TEMPLATE = path.resolve(PUBLIC, './index.html')
    const STYLE_INJECTION = '<!-- #STYLE-INJECTION -->'
    const REACT_INJECTION = '<!-- #REACT-INJECTION -->'

    // data
    const htmlTemplate = fs.readFile(HTML_TEMPLATE, 'utf-8')
    const stylesServer = createStylesServer()

    // helpers
    const inject = (html: string, tag: string, value: string) => {
        if (!html.includes(tag))
            throw new Error(`${tag} missing from html`)

        return html.replace(tag, value)
    }

    // middleware
    return async ctx => {

        const htmlContent = renderToString(
            createElement(
                StaticRouter,
                {
                    location: ctx.request.url ?? '/'
                },
                createElement(Website)
            )
        )

        const styleContent = renderToStaticMarkup(
            createElement(
                ServerStyles, 
                {
                    html: htmlContent,
                    server: stylesServer
                }
            )
        )

        const htmlPage = await htmlTemplate
        const htmlPageWithStyles = inject(htmlPage, STYLE_INJECTION, styleContent)
        const htmlPageWithStylesAndContent = inject(htmlPageWithStyles, REACT_INJECTION, htmlContent)
        console.log('URL', ctx.request.url)
        console.log('HTML', htmlPageWithStylesAndContent)

        ctx.status = 200
        ctx.body = htmlPageWithStylesAndContent
    }
}

//// App ////

class Server {

    private readonly _koa: Koa
    
    readonly log: Logger

    constructor() {

        this._koa = new Koa
        this._koa.use(servePublic())
        this._koa.use(renderClient())

        this.log = new Logger({ timeStamp: true })
    }

    start(port: number) {
        this._koa.listen(port)
        this.log`server started on ${port}`
    }

}

//// Exports ////

export { Server }