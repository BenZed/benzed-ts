import {
    Renderer,
    RendererConfig
} from '@benzed/renderer'

import { 
    FeathersFileService
} from '../middleware/util'
import { File } from '../schema'

/*** Types ***/

interface RenderServiceConfig extends RendererConfig {
    files: FeathersFileService
}

/*** Main ***/

class RenderService {

    private readonly _renderers: [...Renderer[]]
    private readonly _files: FeathersFileService

    public readonly settings: RendererConfig['settings']

    public constructor (config: RenderServiceConfig) {
        const {
            files,
            maxConcurrent = 1,
            settings,
        } = config

        this.settings = settings

        this._files = files

        this._renderers = maxConcurrent > 0
            ? [
                new Renderer({ 
                    maxConcurrent, 
                    settings 
                })
            ]
            : []

        this._applyFileHandlers()
    }

    // eslint-disable-next-line
    public create(data: any, params?: any): any {

        console.log({params})

        /**
         * TODO
         * - create renderer from data or create render request from data? unsure.
         */

    }

    // Helper

    private _applyFileHandlers(): void {

        this._files.on('patch', (file: File) => {
            // - if renderable file
            // - if renders not already queued
            // - if renders not already made
            // - send to queue
        })

        this._files.on('remove', (file: File) => {
            // - if renders queued
            // - remove from queue
        })

    }

}

/*** Exports ***/

export default RenderService

export {
    RenderService,
    RenderServiceConfig
}