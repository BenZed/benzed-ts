import { App } from '@benzed/app'

import { ServeUI } from './serve-ui'
import { Slide } from './slide'

//// Main ////

export class WWW extends App {

    serveUI = new ServeUI

    slide = new Slide

}

export const www = new WWW

export const server = www.asServer()

export const client = www.asClient()