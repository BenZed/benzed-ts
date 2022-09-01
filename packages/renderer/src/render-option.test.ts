import {
    isRenderOption,
    isRendererOptions
} from './render-options'
import { describeValidator } from './util.test'

describeValidator({
    describe: 'isRendererOptions validator',
    factory: () => isRendererOptions,
    input: [],
    data: [
        [
            {
                music: {
                    type: 'audio',
                    abr: 100
                }
            },
            true
        ],
        [
            {
                movie: {
                    type: 'video',
                    vbr: 100
                }
            },
            true
        ],
        [
            {
                picture: {
                    type: 'image',
                    size: { scale: 1 },
                    time: { seconds: 0 }
                }
            },
            true
        ],
        [
            { type: 'media', abr: 1000 },
            false
        ],
        [
            null,
            false
        ]
    ],
})

describeValidator({
    describe: 'isRenderOption validator',
    factory: () => isRenderOption,
    input: [],
    data: [
        [
            {
                type: 'audio',
                abr: 100
            },
            true
        ],
        [
            {
                type: 'video',
                vbr: 100
            },
            true
        ],
        [
            {
                type: 'image',
                size: { scale: 1 },
                time: { seconds: 0 }
            },
            true
        ],
        [
            { type: 'media', abr: 1000 },
            false
        ],
        [
            null,
            false
        ]
    ],
})
