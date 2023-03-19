import { App } from '@benzed/app'

import { ServeUI } from './serve-ui'
import { Presentation } from './presentation'

//// Main ////

export class WWW extends App {

    serveUI = new ServeUI

    presentation = new Presentation

}

export const www = new WWW

export const server = www.asServer()

export const client = www.asClient()