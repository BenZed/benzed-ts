
import { $id, $pagination, $querySyntax, $ref } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'

import { $awsConfig } from '../../schemas/aws-config'

/*** Helper ***/

const $size = $.integer.range('>', 0)

/*** File Service Config ***/

export interface FileServiceConfig extends Infer<typeof $fileServiceConfig> {}
export const $fileServiceConfig = $({
    
    fs: $.or( $.string, $.null ).name('fs-config'),

    s3: $.or( $awsConfig, $.null ).name('aws-config'),

    pagination: $pagination

})

/*** File ***/

export interface FileData extends Infer<typeof $fileData> {}
export const $fileData = $({

    name: $.string,

    uploader: $ref,

    ext: $.string.format(/^\.[a-z]+$/i, 'must be a file extension'),
    type: $.string,
    size: $size,

    renders: $.array(
        $.shape({
            key: $.string,
            size: $size,
            rendered: $.date
        })
    ).default([]),

    created: $.date,
    updated: $.date,
    uploaded: $.or($.date, $.null)
        .default(null),

})

export interface File extends Infer<typeof $file> {}
export const $file = $({

    _id: $id,

    ...$fileData.$

})

export interface FilePatchData extends Infer<typeof $filePatchData> {}
export const $filePatchData = $({

    uploaded: $file.$.uploaded,

    renders: $file.$.renders

})

export interface FileCreateData extends Infer<typeof $fileCreateData> {}
export const $fileCreateData = $({

    name: $file.$.name.format(/\.[a-z]+$/i, 'must have file extension'),

    uploader: $file.$.uploader,

    size: $file.$.size

})

export interface FileQuery extends Infer<typeof $fileQuery> {}
export const $fileQuery = $querySyntax($fileData.$)