import fs from 'fs'

import { isRenderSetting } from './render-settings'
import { AddRenderTaskOptions, Renderer, RenderTaskResult } from './renderer'

import { QueueItem } from '@benzed/async'

describe('construct', () => {

    it('throws if no render options are provided', () => {
        expect(() => new Renderer({}))
            .toThrow('requires at least one RenderSetting')
    })

})

describe('static from() method', () => {

    it('gets a render option from a json url', async () => {

        const renderer = await Renderer.from('./test-assets/render-settings.json')

        expect(isRenderSetting(renderer.settings['image-low'])).toBe(true)
        expect(isRenderSetting(renderer.settings['image-medium'])).toBe(true)
        expect(isRenderSetting(renderer.settings['image-high'])).toBe(true)
    })

    it('throws if provided json is not formatted correctly', async () => {
        await expect(Renderer.from('./test-assets/render-settings-bad.json'))
            .rejects
            .toThrow('not a valid RenderSettings object')
    })

})

describe('add() method', () => {

    const settings = {
        movie: {
            type: 'video' as const,
            vbr: 500,
            abr: 250,
            size: { scale: 0.25 }
        },
        picture: {
            type: 'image' as const,
            size: { scale: 0.5 },
            time: { progress: 0.5 }
        }
    }

    let renderer: Renderer<typeof settings>
    let items: QueueItem<RenderTaskResult<typeof settings>>[]
    beforeAll(async () => {
        renderer = new Renderer(settings)

        items = renderer.add({
            source: './test-assets/boss-media-pneumonic.mp4',
            target: './test-assets/renders'
        })

        await Promise.all(items.map(item => item.finished()))
    })

    it('creates an item for each render option', () => {

        const itemForEachRenderKey = Object
            .keys(renderer.settings)
            .every(key => items.find(item => item.value?.setting === key))

        expect(itemForEachRenderKey).toEqual(true)
    })

    it('renders a file for each item in the queue', () => {

        const allItemsRendered = items
            .every(item =>
                fs.existsSync(item.value?.output as string)
            )

        expect(allItemsRendered).toBe(true)
    })

    it('target as a method allows for control over output items as streams', async () => {

        const CUSTOM_PATH_PART = 'from-gif'

        const items = renderer.add({
            source: './test-assets/boss-media-pneumonic.gif',
            target({ setting, ext }) {
                return `./test-assets/renders/${CUSTOM_PATH_PART}_${setting}${ext}`
            }
        })

        await Promise.all(items.map(item => item.finished()))

        const allItemsUsedTargetMethod = items
            .every(item => item
                .value
                ?.output
                ?.toString()
                .includes(CUSTOM_PATH_PART)
            )

        expect(allItemsUsedTargetMethod).toBe(true)
    })

    it('settings options allows for render of only specific settings', async () => {

        const items = renderer.add({
            source: './test-assets/boss-media-logo.png',
            settings: ['picture'],
            target({ ext }) {
                return fs.createWriteStream(
                    `./test-assets/renders/only-picture-setting${ext}`
                )
            }
        })

        await Promise.all(items.map(item => item.finished()))

        expect(items.length).toBe(1)
        expect(items[0].value?.setting).toBe('picture')
    })

    it('has typesafe support for render settings', () => {

        const options: AddRenderTaskOptions<typeof settings> = {
            source: '',
            target: '',
            settings: [
                'movie',
                // @ts-expect-error picture should not be a valid render setting
                'song'
            ]
        }
        void options
    })

})