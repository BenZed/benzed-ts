import { FeathersService } from '@feathersjs/feathers'
import { MongoDBApplication } from '@benzed/feathers'
import { RendererConfig } from '@benzed/renderer'

import { RenderService } from './render-service'

/*** Types ***/

interface RenderServiceRefs<A extends MongoDBApplication> {
    app: A
    path: string
}

/*** Main ***/

function setupRenderService<A extends MongoDBApplication>(
    refs: RenderServiceRefs<A>,
    config: RendererConfig
): FeathersService<A, RenderService> {

    const { app, path } = refs

    const service = new RenderService({ app, ...config })

    app.use(path, service)
    
    app.log`render service configured`

    return app.service(path) as unknown as FeathersService<A, RenderService> 
}

/*** Exports ***/

export default setupRenderService

export {
    RenderService
}