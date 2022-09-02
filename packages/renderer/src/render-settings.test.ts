import {
    isRenderSetting,
    isRenderSettings
} from './render-settings'

import { describeValidator } from './util.test'

describeValidator({
    describe: 'isRendererSettings validator',
    factory: () => isRenderSettings,
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
    describe: 'isRenderSetting validator',
    factory: () => isRenderSetting,
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
