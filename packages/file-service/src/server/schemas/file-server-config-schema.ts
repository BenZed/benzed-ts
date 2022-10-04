import $, { Infer } from '@benzed/schema'
import { $mongoDBApplicationConfig } from '@benzed/feathers'
import { $rendererConfig } from '@benzed/renderer'

/*** Schema ***/

const $fileServerConfig = $({
    ...$mongoDBApplicationConfig.properties,

    renderer: $.or($rendererConfig, $.null())
})

type FileServerConfig = Infer<typeof $fileServerConfig>

/*** Exports ***/

export default $fileServerConfig

export {
    $fileServerConfig,
    FileServerConfig
}