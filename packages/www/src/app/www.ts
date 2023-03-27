import { App } from '@benzed/app'

import { ServeUI } from './serve-ui'

//// Main ////

export class WWW extends App {
    serveUI = new ServeUI
}

export const www = new WWW

export const server = www.asServer({ port: 5000 })

export const client = www.asClient({
    host: 'http://24.86.168.131:5000'
})