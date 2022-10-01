import { $mongoDBApplicationConfig } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'

/*** Schema ***/

const $fileServerConfig = $({

    ...$mongoDBApplicationConfig.properties,

    renderer: $({
        maxConcurrent: $.number().floor(1).range('>', 0),
        settings: $.record($.string())
    })
})

type FileServerConfig = Infer<typeof $fileServerConfig>

/*** Exports ***/

export default $fileServerConfig

export {
    $fileServerConfig,
    FileServerConfig
}