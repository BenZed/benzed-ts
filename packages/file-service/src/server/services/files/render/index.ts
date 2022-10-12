import { FeathersService } from '@feathersjs/feathers'
import { MongoDBApplication } from '@benzed/feathers'
import { RendererConfig } from '@benzed/renderer'

import { RenderService } from './render-service'

/*** Types ***/

interface RenderServiceSettings {
    path: string
    renderer: RendererConfig
}

/*** Main ***/

function setupRenderService<A extends MongoDBApplication>(
    app: A,
    settings: RenderServiceSettings
): FeathersService<A, RenderService> {

    const { renderer, path } = settings

    app.use(

        path, 

        new RenderService({ 
            app, 
            ...renderer 
        })

    )
    
    app.log`render service configured`

    return app.service(path) as unknown as FeathersService<A, RenderService> 
}

/*** Exports ***/

export default setupRenderService

export {
    RenderService
}