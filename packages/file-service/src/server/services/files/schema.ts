
import { $querySyntax } from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'
import { $awsConfig } from '../../schemas/aws-config'

/* eslint-disable
    @typescript-eslint/no-empty-interface
*/

/*** File Service Config ***/

export type FileServiceConfig = Infer<typeof $fileData>
export const $fileServiceConfig = $({
    
    fs: $.or(
        $.null(), 
        $.string()
    ),

    s3: $.or(
        $.null(), 
        $awsConfig
    )

})

/*** File Schemas ***/

export type FileData = Infer<typeof $fileData>
export const $fileData = $({

    name: $.string(),

    uploader: $.string(),
    uploaded: $.integer().range('>=',0),

    size: $.integer().range('>',0),

    ext: $.string(),
    mime: $.string(),

    created: $.date(),
    updated: $.date(),

})

export type File = Infer<typeof $file>
export const $file = $({

    _id: $.string(),

    ...$fileData.$

})

export type FilePatchData = Infer<typeof $filePatchData>
export const $filePatchData = $({

    uploaded: $file.$.uploaded

} as const)

export type FileCreateData = Infer<typeof $fileCreateData>
export const $fileCreateData = $({

    name: $file.$.name,

    uploader: $file.$.uploader,
    size: $file.$.size

})

/*** File Query ***/

export const $fileQuery = $querySyntax($fileData.$)

export type FileQuery = Infer<typeof $fileQuery>