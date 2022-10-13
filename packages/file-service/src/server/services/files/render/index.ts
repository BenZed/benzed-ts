import { FeathersService } from '@feathersjs/feathers'
import { MongoDBApplication } from '@benzed/feathers'
import { RendererConfig } from '@benzed/renderer'

import { Server } from 'socket.io'

import { RenderService } from './service'
import { FeathersFileService } from '../middleware/util'

/*** Types ***/

interface RenderServiceSettings {
    path: string
    files: FeathersFileService
    renderer: RendererConfig
}

/*** Main ***/

function setupRenderService<A extends MongoDBApplication>(
    app: A,
    settings: RenderServiceSettings
): FeathersService<A, RenderService> {

    const { renderer, files, path } = settings

    app.use(
        path, 
        new RenderService({ 
            app,
            files,
            ...renderer 
        })
    )

    app.on('listen', () => {
        const { io } = app as { io?: Server }
        if (!io) {
            void app.teardown()
            throw new Error('render service requires app be configured with socket.io')
        }
    })
    
    app.log`render service configured`

    return app.service(path) as unknown as FeathersService<A, RenderService> 
}

/*** Exports ***/

export default setupRenderService

export {
    RenderService
}