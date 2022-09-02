import path from 'path'
import fs from 'fs'

import { isNumber } from '@benzed/is'

import { RENDER_FOLDER, TEST_ASSETS } from '../../test-assets'

import createPNG from './create-png'
import getMetadata from './get-metadata'

import { SizeSetting, TimeSetting } from './settings'

type TestInput = {
    options: Partial<SizeSetting> & Partial<TimeSetting>
    label: string
    stream?: boolean
}[]

describe.skip('createPNG', () => {

    const testInput: TestInput = [
        { options: {}, label: 'unspecified' },
        { options: { progress: 0 }, label: 'beginning' },
        { options: { progress: 0.5 }, label: 'middle' },
        { options: { progress: 1 }, label: 'end' },
        { options: { seconds: 0.125 }, label: 'time 1-8' },
        { options: { seconds: 0.25 }, label: 'time 1-4' },
        { options: { seconds: 0.5 }, label: 'time 1-2' },
        { options: { progress: 0.5, scale: 0.5 }, label: 'middle @ half size' },
        { options: { progress: 0.5, width: 26 }, label: 'middle @ width 26' },
        { options: { progress: 0.5, height: 32 }, label: 'middle @ height 32' },
        { options: { progress: 0.5, dimensions: 40 }, label: 'middle @ dimensions 40' },
    ]

    const testInputWithStreams = testInput.map(o => ({
        ...o,
        stream: true,
        label: 'stream ' + o.label
    }))

    const types = [
        'mp4',
        'gif',
        'png',
        'jpg'
    ] as const

    // input multiplied by scale to the nearest even integer
    const toTargetDimension = (axis: number, scale: number): number => {
        let target = Math.floor(axis * scale)
        target -= target % 2
        return target
    }

    for (const type of types) {
        for (const { options, label, stream } of [...testInput, ...testInputWithStreams]) {

            it(`extracts a frame from ${type} input ${label}`, async () => {

                const input = TEST_ASSETS[type]
                const outputUrl = path.join(RENDER_FOLDER, `test-${type}-${label}.png`)

                const output = stream
                    ? fs.createWriteStream(outputUrl)
                    : outputUrl

                await createPNG({
                    input: input,
                    output: output,
                    ...options
                })

                const inputMetadata = await getMetadata({ input })
                const outputMetadata = await getMetadata({ input: outputUrl })

                expect(fs.existsSync(outputUrl)).toEqual(true)

                if ('scale' in options && isNumber(options.scale)) {

                    expect(outputMetadata.width)
                        .toEqual(
                            toTargetDimension(inputMetadata.width as number, options.scale)
                        )
                    expect(outputMetadata.height)
                        .toEqual(
                            toTargetDimension(inputMetadata.height as number, options.scale)
                        )
                }

                if ('width' in options && isNumber(options.width))
                    expect(outputMetadata.width).toEqual(options.width)

                if ('height' in options && isNumber(options.height))
                    expect(outputMetadata.height).toEqual(options.height)

                if ('dimensions' in options && isNumber(options.dimensions)) {
                    expect(outputMetadata.width).toEqual(options.dimensions)
                    expect(outputMetadata.height).toEqual(options.dimensions)
                }
            })
        }
    }
})