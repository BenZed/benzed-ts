
import { $id, $pagination, $querySyntax, $ref } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'

import { $awsConfig } from '../../schemas/aws-config'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** File Service Config ***/

export type FileServiceConfig = Infer<typeof $fileServiceConfig>
export const $fileServiceConfig = $({
    
    fs: $.or( $.null, $.string ).name('fs-config'),

    s3: $.or( $.null, $awsConfig ).name('aws-config'),

    pagination: $pagination

})

/*** File ***/

export type FileData = Infer<typeof $fileData>
export const $fileData = $({

    name: $.string,

    uploader: $ref,
    uploaded: $.boolean,

    size: $.integer.range('>', 0),

    ext: $.string.format(/^\.[a-z]+$/i, 'must be a file extension'),
    type: $.string,

    created: $.date,
    updated: $.date,

})

export type File = Infer<typeof $file>
export const $file = $({

    _id: $id,

    ...$fileData.$

})

export type FilePatchData = Infer<typeof $filePatchData>
export const $filePatchData = $({

    uploaded: $file.$.uploaded

})

export type FileCreateData = Infer<typeof $fileCreateData>
export const $fileCreateData = $({

    name: $file.$.name.format(/\.[a-z]+$/i, 'must have file extension'),
    uploader: $file.$.uploader,
    size: $file.$.size

})

export type FileQuery = Infer<typeof $fileQuery>
export const $fileQuery = $querySyntax($fileData.$)