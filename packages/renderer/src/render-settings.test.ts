import {
    isRenderSetting,
    isRendererConfig
} from './render-settings'

import { describeValidator } from './util.test'

describeValidator({
    describe: 'isRenderConfig validator',
    factory: () => isRendererConfig,
    input: [],
    data: [
        [
            {
                settings: {
                    music: {
                        type: 'audio',
                        abr: 100
                    }
                }
            },
            true
        ],
        [
            {
                settings: {
                    movie: {
                        type: 'video',
                        vbr: 100
                    }
                }
            },
            true
        ],
        [
            {
                settings: {

                    picture: {
                        type: 'image',
                        size: { scale: 1 },
                        time: { seconds: 0 }
                    }
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
        ],
        [
            {
                maxConcurrent: 'none',
                settings: {

                    picture: {
                        type: 'image',
                        size: { scale: 1 },
                        time: { seconds: 0 }
                    }
                }
            },
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
