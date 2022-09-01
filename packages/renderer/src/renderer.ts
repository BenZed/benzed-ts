
import fs from '@benzed/fs'
import { Queue, QueueItem } from '@benzed/async'

import { RendererOptions, assertRendererOptions } from './render-options'
import RenderJob from './render-job'

/*** Main ***/

class Renderer {

    private readonly _queue: Queue<RenderJob> = new Queue()

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

    public constructor (options: RendererOptions) {

        const numOptions = Object.keys(options).length
        if (numOptions === 0)
            throw new Error('requires at least one RenderOption')

        this.options = {
            ...options
        }
    }

    public add(): QueueItem<RenderJob> {

        const job = new RenderJob()

        for (const key in this.options) {
            const renderOption = this.options[key]

        }

        return this._queue.add(() => {

        })
    }
}

/*** Exports ***/

export default Renderer

export {
    Renderer
}