import {
    $renderSetting,
    $rendererConfig
} from './render-settings'

import { describeValidator } from './util.test'

describeValidator({
    describe: '$rendererConfig.is validator',
    factory: () => $rendererConfig.is,
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
    describe: '$renderSetting.is validator',
    factory: () => $renderSetting.is,
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
