import { $mongoDBApplicationConfig, $pagination } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'
import { $rendererConfig } from '@benzed/renderer'

/*** Schema ***/

const $fileServerConfig = $({
    ...$mongoDBApplicationConfig.properties,

    pagination: $pagination,
    
    renderer: $.or($rendererConfig, $.null()),

    authentication: $.or($.object(), $.null()),

})

type FileServerConfig = Infer<typeof $fileServerConfig>

/*** Exports ***/

export default $fileServerConfig

export {
    $fileServerConfig,
    FileServerConfig
}