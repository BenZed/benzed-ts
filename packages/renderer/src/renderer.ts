
import fs from '@benzed/fs'
import { Queue } from '@benzed/async'

import { RendererOptions, assertRendererOptions } from './render-options'
import RenderJob from './render-job'

/*** Main ***/

class Renderer extends Queue<RenderJob> {

    public readonly options: RendererOptions

    /**
     * Create a render instance from a json config.
     * @param configUrl 
     * @returns 
     */
    public static async from(configUrl: string): Promise<Renderer> {

        const options = await fs.readJson(
            configUrl,
            assertRendererOptions
        )

        return new Renderer(options)
    }

    public constructor (options?: RendererOptions) {

        super()

        this.options = {
            ...options
        }

    }
}

/*** Exports ***/

export default Renderer

export {
    Renderer
}