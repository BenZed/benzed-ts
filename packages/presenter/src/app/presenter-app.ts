import { App } from '@benzed/app'
import { Presenter } from './presenter'

import { ServeUI } from './serve-ui'
import * as markdownComponents from '../client/components/markdown-components'

//// Main ////

export class PresenterApp extends App {

    serveUI = new ServeUI

    presenter = new Presenter({
        ...markdownComponents
    })

}

//// Extras ////

export const presenterApp = new PresenterApp

export const presenterServer = presenterApp.asServer({ port: 4000 })

export const presenterClient = presenterApp.asClient({ host: 'http://24.86.168.131:4000' })