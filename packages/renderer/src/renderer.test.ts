import fs from 'fs'
import path from 'path'

import { isRenderSetting } from './render-settings'
import { AddRenderItemOptions, Renderer, RenderItem } from './renderer'

import { RENDER_FOLDER, TEST_ASSETS } from '../test-assets'
import { getMetadata, isMetadata } from './ffmpeg'
import { floor } from '@benzed/math'

describe('construct', () => {
    it('throws if no render options are provided', () => {
        expect(() => new Renderer({ settings: {} }))
            .toThrow('requires at least one RenderSetting')
    })
})

describe('static from() method', () => {
    it('gets a render option from a json url', async () => {
        const renderer = await Renderer.from(TEST_ASSETS.config)
        expect(isRenderSetting(renderer.config.settings['image-low'])).toBe(true)
        expect(isRenderSetting(renderer.config.settings['image-medium'])).toBe(true)
        expect(isRenderSetting(renderer.config.settings['image-high'])).toBe(true)
    })

    it('throws if provided json is not formatted correctly', async () => {
        await expect(Renderer.from(TEST_ASSETS.badConfig))
            .rejects
            .toThrow('not a valid RenderConfig object')
    })
})

describe('add() method', () => {

    const MP4_SCALE = 0.25
    const PNG_SCALE = 0.25

    const config = {
        settings: {
            movie: {
                type: 'video' as const,
                vbr: 500,
                abr: 250,
                size: { scale: MP4_SCALE }
            },
            picture: {
                type: 'image' as const,
                size: { scale: PNG_SCALE },
                time: { progress: 0.5 }
            }
        }
    }

    const { settings } = config

    const INPUT_SOURCE = TEST_ASSETS.mp4

    let renderer: Renderer<typeof config>
    let items: RenderItem<typeof settings>[]
    beforeAll(async () => {
        renderer = new Renderer(config)

        items = renderer.add({
            source: INPUT_SOURCE,
            target: RENDER_FOLDER
        })

        await Promise.all(items.map(item => item.complete()))
    })

    it('creates an item for each render option', () => {

        const itemForEachRenderKey = Object
            .keys(renderer.config.settings)
            .every(key => items.find(item => item.setting === key))

        expect(itemForEachRenderKey).toEqual(true)
    })

    it('renders a file for each item in the queue', () => {

        const allItemsRendered = items
            .every(item =>
                fs.existsSync(item.output as string)
            )

        expect(allItemsRendered).toBe(true)
    })

    it('target as a method allows for control over output items as streams', async () => {

        const CUSTOM_PATH_PART = 'from-gif'

        const items = renderer.add({
            source: TEST_ASSETS.gif,
            target({ setting, ext }) {
                return path.join(
                    RENDER_FOLDER,
                    `${CUSTOM_PATH_PART}_${setting}${ext}`
                )
            }
        })

        await Promise.all(items.map(item => item.complete()))

        const allItemsUsedTargetMethod = items
            .every(item => item
                ?.output
                ?.toString()
                .includes(CUSTOM_PATH_PART)
            )

        expect(allItemsUsedTargetMethod).toBe(true)
    })

    it('settings options allows for render of only specific settings', async () => {

        const items = renderer.add({
            source: TEST_ASSETS.png,
            settings: ['picture'],
            target({ ext }) {
                return fs.createWriteStream(
                    path.join(
                        RENDER_FOLDER,
                        `only-picture-setting${ext}`
                    )
                )
            }
        })

        await Promise.all(items.map(item => item.complete()))

        expect(items.length).toBe(1)
        expect(items[0].setting).toBe('picture')
    })

    it('gets metadata results', () => {
        for (const item of items)
            expect(isMetadata(item.result?.value)).toBe(true)
    })

    it('size settings are respected', async () => {
        const [movie, image] = items

        const meta = await getMetadata({ input: INPUT_SOURCE })

        for (const dimensionKey of ['width', 'height'] as const) {
            const dimension = meta[dimensionKey] ?? 0

            expect(movie.result?.value?.[dimensionKey]).toBe(floor(dimension * MP4_SCALE, 2))
            expect(image.result?.value?.[dimensionKey]).toBe(floor(dimension * PNG_SCALE, 2))
        }
    })

    it('has typesafe support for render settings', () => {

        const options: AddRenderItemOptions<typeof settings> = {
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