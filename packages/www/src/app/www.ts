import { App } from '@benzed/app'

import { ServeUI } from './serve-ui'
import { Presentation } from './presentation'

//// Main ////

export class WWW extends App {

    serveUI = new ServeUI

    presentation = new Presentation

}

export const www = new WWW

export const server = www.asServer({ port: 4000 })

export const client = www.asClient({
    host: 'http://24.86.168.131:4000'
})