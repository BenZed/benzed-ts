import {

    Renderer,
    RenderSetting,
    RendererConfig

} from '@benzed/renderer'

import { Params } from '@feathersjs/feathers'

import ServerRenderer from './server-renderer'

import { FileServerApp } from '../../create-file-server-app'

/*** Types ***/

interface RenderServiceConfig extends RendererConfig {

    app: FileServerApp

}

/*** Main ***/

class RenderService {

    private readonly _renderers: [Renderer, ...ServerRenderer[]]
    private readonly _app: FileServerApp

    public constructor (config: RenderServiceConfig) {
        const {
            app,
            maxConcurrent = 1,
            // 
            ...rest
        } = config

        // Renders handled by this machine specifically
        const local = new Renderer({ maxConcurrent, ...rest })

        this._app = app
        this._renderers = [local]
    }

    public create(data: string, params: Params): Promise<RenderSetting> {
        /**
         * TODO
         * - create renderer from data or create render request from data? unsure.
         */
    }

}

/*** Exports ***/

export default RenderService

export {
    RenderService,
    RenderServiceConfig
}