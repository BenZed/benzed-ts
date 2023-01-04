import fs from '@benzed/fs'
import $, { Infer } from '@benzed/schema'
import { $id, $pagination, $querySyntax, $ref } from '@benzed/feathers'

//// Helper ////

const $size = $.integer.range('>', 0)

const $directory = $.string
    .asserts(fs.sync.exists, dir => `'${dir}' does not exist`)
    .asserts(dir => fs.sync.stat(dir).isDirectory(), 'must be a directory')
    .name('directory')

export interface AwsConfig extends Infer<typeof $awsConfig> {}
export const $awsConfig = $({

    bucket: $.string,
    accessKeyId: $.string,
    secretAccessKey: $.string

})

//// File Service Config ////

export interface FileServiceConfig extends Infer<typeof $fileServiceConfig> {}
export const $fileServiceConfig = $({
    
    fs: $.or( $directory, $.null )
        .name('fs-config'),

    s3: $.or( $awsConfig, $.null )
        .name('aws-config'),

    path: $.string
        .format(/^\/([a-z]|-)+/, 'must be a path')
        .name('path'),

    pagination: $pagination,
})

//// File Payload ////

export interface FilePayload extends Infer<typeof $filePayload> {}
export const $filePayload = $({

    file: $id,
    uploader: $id,

    action: $.or(
        $({ 
            render: $.string.optional,
            part: $.number 
        }), 

        $({ 
            render: $.string.optional,
            complete: $(true) 
        })
    )

}).name('file-payload')

//// File ////

export interface FileData extends Infer<typeof $fileData> {}
export const $fileData = $({

    name: $.string,

    uploader: $ref,

    ext: $.string
        .format(/^\.([a-z]|\d)+$/i, 'must be a file extension'),
    
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

    name: $file.$
        .name
        .format(/\.([a-z]|\d)+$/i, 'must have file extension'),

    uploader: $file.$.uploader,
    size: $file.$.size,
})

export interface FileQuery extends Infer<typeof $fileQuery> {}
export const $fileQuery = $querySyntax($fileData.$)