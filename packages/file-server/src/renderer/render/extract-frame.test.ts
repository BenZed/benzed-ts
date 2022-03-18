import path from 'path'
import fs from 'fs'

import { RENDER_FOLDER, TEST_ASSETS } from '../../../test-assets'

import extractFrame from './extract-frame'
import getMetadata from './get-metadata'
import { isNumber } from '@benzed/is'
import { SizeOptions, TimeOptions } from './options'

type TestInput = {
    options: SizeOptions & TimeOptions
    label: string
    stream?: boolean
}[]

describe('extractFrame', () => {

    const testInput: TestInput = [
        { options: { progress: 0 }, label: 'beginning' },
        { options: { progress: 0.5 }, label: 'middle' },
        { options: { progress: 1 }, label: 'end' },
        { options: { time: 0.125 }, label: 'time 0.125' },
        { options: { time: 0.25 }, label: 'time 0.250' },
        { options: { time: 0.5 }, label: 'time 0.550' },
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
        'png',
        'gif',
        'mp4',
        'jpg',
    ] as const

    for (const type of types) {
        for (const { options, label, stream } of [...testInput, ...testInputWithStreams]) {
            it(`extracts a frame from ${type} input stream ${label}`, async () => {

                const input = TEST_ASSETS[type]
                const outputUrl = path.join(RENDER_FOLDER, `test-frame-from-${type}-${label}.png`)

                const output = stream
                    ? fs.createWriteStream(outputUrl)
                    : outputUrl

                await extractFrame({
                    input: input,
                    output: output,
                    ...options
                })

                const inputMetadata = await getMetadata({ input })
                const outputMetadata = await getMetadata({ input: outputUrl })

                expect(fs.existsSync(outputUrl)).toEqual(true)

                if ('scale' in options && isNumber(options.scale)) {
                    expect(outputMetadata.width)
                        .toEqual(inputMetadata.width as number * options.scale)
                    expect(outputMetadata.height)
                        .toEqual(inputMetadata.height as number * options.scale)
                }

                if ('width' in options && isNumber(options.width)) {
                    expect(outputMetadata.width)
                        .toEqual(options.width)
                }

                if ('height' in options && isNumber(options.height)) {
                    expect(outputMetadata.height)
                        .toEqual(options.height)
                }

                if ('dimensions' in options && isNumber(options.dimensions)) {
                    expect(outputMetadata.width)
                        .toEqual(options.dimensions)
                    expect(outputMetadata.height)
                        .toEqual(options.dimensions)
                }
            })
        }
    }
})