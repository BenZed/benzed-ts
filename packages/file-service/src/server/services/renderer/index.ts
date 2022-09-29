import { RendererConfig } from '@benzed/renderer'

import { FileServerApp } from '../../create-file-server-app'
import { RenderService } from './render-service'

/*** Declare ***/

declare module '../../create-file-server-app' {

    interface FileServices {
        'files/render': RenderService
    }

    interface FileServerConfig {
        'renderer': RendererConfig
    }

}

/*** Exports ***/

export default function setupRenderService(
    app: FileServerApp
): void {

    const settings = app.get('renderer')

    const service = new RenderService({ app, ...settings })

    app.use('files/render', service)
    app.log`renderer service configured`

}