import type { FileServerApp } from '../../create-file-server-app'
import { RenderService } from './render-service'

/*** Main ***/

function setupRenderService(
    app: FileServerApp
): void {

    const renderer = app.get('renderer')
    if (!renderer) {
        app.log`renderer service not enabled`
        return
    }

    const service = new RenderService({ app, ...renderer })

    app.use('files/render', service)
    app.log`renderer service configured`

}

/*** Exports ***/

export default setupRenderService

export {
    RenderService
}