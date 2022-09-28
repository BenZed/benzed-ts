
import path from 'path'

import {
    assertRenderConfig,
    RendererConfig,
    RenderSetting
} from './render-settings'

import {
    createMP3,
    createMP4,
    createPNG,
    RenderMetadata
} from './ffmpeg'

import { Input, Output } from './ffmpeg/settings'

import { Queue, QueueItem } from '@benzed/async'
import { StringKeys } from '@benzed/util'
import { isString } from '@benzed/is'
import fs from '@benzed/fs'
import { cpus } from 'os'

/*** Constants ***/

const EXT = {
    audio: '.mp3',
    video: '.mp4',
    image: '.png',
    //
} as const

/**
 * Given a file name and render option key, return a writable stream or 
 * a location on the local file system to write the rendered file.
 */
type TargetMethod = <R extends RendererConfig['settings'] = RendererConfig['settings']>(
    data: {
        fileName: string
        ext: string
        setting: StringKeys<R>
    }
) => Output['output']

interface AddRenderItemOptions<S extends RendererConfig['settings'] = RendererConfig['settings']> {
    /**
     * Source file or stream
     */
    readonly source: Input['input']

    /**
     * TargetMethod or a path to a target directory 
     */
    readonly target: string | TargetMethod

    /**
     * Render specific settings
     */
    readonly settings?: StringKeys<S>[]
}

type RenderTask = () => Promise<RenderMetadata>

interface RenderData<R extends RendererConfig['settings'] = RendererConfig['settings']>
    extends Input, Output {

    setting: StringKeys<R>

}

type RenderItem<R extends RendererConfig['settings'] = RendererConfig['settings']> =
    QueueItem<RenderMetadata, RenderData<R>>

/*** Helper ***/

function getOutput<R extends RendererConfig['settings']>(
    options: AddRenderItemOptions<R>,
    type: RenderSetting['type'],
    setting: StringKeys<R>
): Output['output'] {

    const { source, target } = options

    const fileName = isString(source)
        ? path.basename(source, path.extname(source))
        : Date.now().toString()

    const ext = EXT[type]

    const output = isString(target)
        ? path.join(target, `${fileName}_${setting}${ext}`)
        : target({ fileName, ext, setting })

    return output
}

function createRenderTask<R extends RendererConfig['settings']>(
    addOptions: AddRenderItemOptions<R>,
    renderSetting: RenderSetting,
    output: Output['output']
): RenderTask {

    const { source: input } = addOptions
    const { type } = renderSetting

    switch (type) {

        case 'image': {

            const { time, size } = renderSetting

            return () => createPNG({
                ...time,
                ...size,
                input,
                output
            })
        }

        case 'video': {

            const { size } = renderSetting

            return () => createMP4({
                ...renderSetting,
                ...size,
                input,
                output
            })
        }

        case 'audio':
            return () => createMP3({
                ...renderSetting,
                input,
                output
            })

        default: {
            const badType: never = type
            throw new Error(
                `${badType} is not a valid render options type.`
            )
        }
    }
}

/*** Main ***/

class Renderer<R extends RendererConfig = RendererConfig> {

    private readonly _queue: Queue<RenderMetadata, RenderData<R['settings']>>

    public readonly config: Required<R>

    /**
     * Create a render instance from a json config.
     */
    public static async from(configUrl: string): Promise<Renderer<RendererConfig>> {

        const options = await fs.readJson(
            configUrl,
            assertRenderConfig
        )

        return new Renderer(options)
    }

    public constructor (config: R) {

        const numOptions = Object
            .keys(config.settings)
            .length

        if (numOptions === 0)
            throw new Error('requires at least one RenderSetting')

        const numCpus = cpus().length

        const { maxConcurrent = numCpus - 1, settings } = config

        if (maxConcurrent > numCpus) {
            throw new Error(
                'config.maxConcurrent cannot be higher ' +
                'than the number of processors on this system ' +
                `(${numCpus})`
            )
        }

        this._queue = new Queue({ maxConcurrent, maxListeners: Infinity })
        this.config = { settings, maxConcurrent } as Required<R>
    }

    /**
     * Returns true if the render queue is complete
     */
    public get isComplete(): boolean {
        return this._queue.isComplete
    }

    /**
     * Returns a promise that fulfills when the queue completes.
     */
    public complete(): Promise<void> {
        return this._queue.complete()
    }

    public add(
        addOptions: AddRenderItemOptions<R['settings']>,
    ): RenderItem<R['settings']>[] {

        const renderItems: RenderItem<R['settings']>[] = []

        const settings = Object.keys(this.config.settings) as StringKeys<R['settings']>[]

        const settingMask =
            addOptions.settings ??
            settings

        for (const setting of settings) {

            if (!settingMask.includes(setting))
                continue

            const renderSettings = this.config.settings[setting]

            const output = getOutput(addOptions, renderSettings.type, setting)

            const renderTask = createRenderTask(addOptions, renderSettings, output)
            const renderItem = this._queue.add({
                task: renderTask,
                setting,
                input: addOptions.source,
                output,
            })

            renderItems.push(renderItem)
        }

        return renderItems
    }

}

/*** Exports ***/

export default Renderer

export {
    Renderer,
    RenderItem,

    RenderTask,
    AddRenderItemOptions
}