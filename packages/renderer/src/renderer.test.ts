import { isRenderOptions } from './render-options'
import Renderer, { RenderTaskResult } from './renderer'

import fs from 'fs'
import { QueueItem } from '@benzed/async'

describe('construct', () => {
    it('throws if no render options are provided', () => {
        expect(() => new Renderer({}))
            .toThrow('requires at least one RenderOption')
    })
})

describe('static from() method', () => {

    it('gets a render option from a json url', async () => {

        const renderer = await Renderer.from('./test-assets/render-options.json')

        expect(isRenderOptions(renderer.options['image-low'])).toBe(true)
        expect(isRenderOptions(renderer.options['image-medium'])).toBe(true)
        expect(isRenderOptions(renderer.options['image-high'])).toBe(true)
    })

    it('throws if provided json is not formatted correctly', async () => {
        await expect(Renderer.from('./test-assets/render-options-bad.json'))
            .rejects
            .toThrow('not a valid RendererOptions object')
    })

})

describe('add() method', () => {

    let renderer: Renderer
    let items: QueueItem<RenderTaskResult>[]
    beforeAll(async () => {
        renderer = await Renderer.from('./test-assets/render-options.json')

        items = renderer.add({
            source: './test-assets/boss-media-pneumonic.mp4',
            target: './test-assets/renders'
        })

        await Promise.all(items.map(item => item.finished()))
    })

    it('creates an item for each render option', () => {

        const itemForEachRenderKey = Object
            .keys(renderer.options)
            .every(key => items.find(item => item.value?.key === key))

        expect(itemForEachRenderKey).toEqual(true)
    })

    it('renders a file for each item in the queue', () => {

        const allItemsRendered = items
            .every(item =>
                fs.existsSync(item.value?.output as string)
            )

        expect(allItemsRendered).toBe(true)
    })

})