import { $rendererConfig } from '@benzed/renderer'
import { $, Infer } from '@benzed/schema'

import { $fileServiceConfig } from '../files-service'

/*** Exports ***/

export interface RenderServiceConfig extends Infer<typeof $renderServiceConfig> {}

export const $renderServiceConfig = $({
    
    path: $fileServiceConfig.$.path,

    channel: $.string.length(`>`, 0),
    
    renderer: $rendererConfig

})
