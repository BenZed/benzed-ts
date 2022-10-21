import { 
    FeathersService, 
    AroundHookFunction
} from '@feathersjs/feathers'

import { 
    authenticate, 
    AuthenticationService
} from '@feathersjs/authentication'

import { MongoDBApplication } from '@benzed/feathers'

import { Server } from 'socket.io'

import { RenderService } from './service'
import { RenderServiceConfig } from './schema'

import { FeathersFileService } from '../files-service/middleware/util'

/*** Helper ***/

function getSocketIOServer(app: MongoDBApplication): Promise<Server> {
    return new Promise((resolve, reject) => app.once(`listen`, () => {
        const { io } = app as { io?: Server }

        if (io)
            resolve(io)
        else {
            void app.teardown()
            reject(
                new Error(`render service requires app be configured with socket.io`)
            )
        }
    }))
}

/*** Hooks ***/

function joinChannel(channel: string): AroundHookFunction {
    return async ({ params, app }, next) => {
        await next()

        if (params.connection) {
            app.channel(channel)
                .join(params.connection)
        }

    }
}

/*** Main ***/

function setupRenderService<A extends MongoDBApplication>(
    configAndRefs: RenderServiceConfig & { 
        app: A
        files: FeathersFileService
        auth?: AuthenticationService
    }
): FeathersService<A, RenderService> {

    const { 
        app, 
        files, 
        auth, 
        renderer,
        path, 
        channel 
    } = configAndRefs

    app.use(
        path, 
        new RenderService({
            io: getSocketIOServer(app),
            files,
            ...renderer 
        })
    )

    const render = app.service(path) 
    render.hooks({
        around: {
            all: auth 
                ? [ authenticate(`jwt`) ] 
                : [],

            create: [ joinChannel(channel) ]
        }
    })

    app.log`render service configured`

    return render as unknown as FeathersService<A, RenderService> 
}

/*** Exports ***/

export default setupRenderService

export {
    RenderService,
    RenderServiceSettings,
} from './service'

export * from './schema'

export * from '../client/create-file-render-app'