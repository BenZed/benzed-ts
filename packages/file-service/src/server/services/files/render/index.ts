import { 
    FeathersService, 
    AroundHookFunction
} from '@feathersjs/feathers'

import { MongoDBApplication } from '@benzed/feathers'
import { RendererConfig } from '@benzed/renderer'

import { Server } from 'socket.io'

import { RenderService } from './service'
import { FeathersFileService } from '../middleware/util'

/*** Types ***/

interface RenderServiceSettings {

    path: string

    /**
     * Channel that renderer clients are placed in to receive
     * render service related events
     */
    channel: string

    files: FeathersFileService

    renderer: RendererConfig

}

/*** Helper ***/

function getSocketIOServer(app: MongoDBApplication): Promise<Server> {
    return new Promise((resolve, reject) => app.once('listen', () => {
        const { io } = app as { io?: Server }

        if (io)
            resolve(io)
        else {
            void app.teardown()
            reject(
                new Error('render service requires app be configured with socket.io')
            )
        }
    }))
}

/*** Hooks ***/

function joinChannel(channel: string): AroundHookFunction {
    return async ({ params, app }, next) => {
        await next()

        if (params.connection)
            app.channel(channel).join(params.connection)
    }
}

/*** Main ***/

function setupRenderService<A extends MongoDBApplication>(
    app: A,
    settings: RenderServiceSettings
): FeathersService<A, RenderService> {

    const { renderer, files, path, channel } = settings

    app.use(
        path, 
        new RenderService({ 
            io: getSocketIOServer(app),
            files,
            ...renderer 
        })
    )

    const renderService = app.service(path) 
    renderService.hooks({
        create: [
            joinChannel(channel)
        ]
    })

    app.log`render service configured`

    return renderService as unknown as FeathersService<A, RenderService> 
}

/*** Exports ***/

export default setupRenderService

export {
    RenderService
}