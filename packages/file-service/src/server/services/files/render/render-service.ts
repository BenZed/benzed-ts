import {
    Renderer,
    RendererConfig
} from '@benzed/renderer'

import { 
    FileServerApp 
} from '../../../create-file-server-app'

/*** Types ***/

interface RenderServiceConfig extends RendererConfig {
    app: FileServerApp
}

/*** Main ***/

class RenderService {

    private readonly _renderers: [...Renderer[]]
    private readonly _app: FileServerApp

    public readonly settings: RendererConfig['settings']

    public constructor (config: RenderServiceConfig) {
        const {
            app,
            maxConcurrent = 1,
            settings,
        } = config

        this.settings = settings

        this._app = app

        this._renderers = maxConcurrent > 0
            ? [
                new Renderer({ 
                    maxConcurrent, 
                    settings 
                })
            ]
            : []
    }

    // eslint-disable-next-line
    public create(data: any, params: any): any {

        console.log(params)

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