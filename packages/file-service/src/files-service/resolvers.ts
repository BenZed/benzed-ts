import { basename as baseNameOf, extname as extOf } from 'path'
import { getType as getMimeType } from 'mime'

import { 
    MongoDBApplication, 
    pipeResolvers, 
    recordMustExist, 
    resolve, 
    timestamp 
} from '@benzed/feathers'

import {

    File,
    $file,

    FileData,

    $filePatchData,

    FileQuery,
    $fileQuery,

    $fileCreateData,

} from './schema'

import type { FileService } from './index'

import { HookContext } from '@feathersjs/feathers'

/* eslint-disable require-await */

//// Constants ////

const DEFAULT_MIME_TYPE = `application/octet-stream`

//// Types ////

type FileServiceHookContext = HookContext<MongoDBApplication, FileService>

//// Exports ////

export const filePatchResolver = resolve<File, FileServiceHookContext>({
    schema: $filePatchData,
    validate: `before`,
    properties: {

        updated: timestamp

    }
})

export const fileCreateResolver = resolve<FileData & { urls: string[] }, FileServiceHookContext>({
    schema: $fileCreateData,
    validate: `before`,
    properties: {

        updated: timestamp,
        created: timestamp,
        uploaded: async () => null,

        uploader: pipeResolvers(
            
            // favour authenticated id
            async (id, _, ctx) => ctx.params.user?._id ?? id ?? null,

            // 
            recordMustExist(`users`)
        ),

        // name without ext
        name: async (fn) => fn && baseNameOf(fn, extOf(fn)),

        // ext from name
        ext: async (_, file) => extOf(file.name),

        // mime type from ext
        type: async (_, file) => getMimeType(extOf(file.name)) ?? DEFAULT_MIME_TYPE,

        renders: async () => [],
    }
})

// Resolver for the data that is being returned
export const fileResolver = resolve<File, FileServiceHookContext>({
    schema: $file,
    validate: false,
    properties: {
        _id: async id => id?.toString()
    }
})

// Resolver for the "safe" version that external clients are allowed to see
export const fileDispatchResolver = resolve<File, FileServiceHookContext>({
    schema: $file,
    validate: false,
    properties: {
        ...fileResolver.options.properties
    }
})

// Resolver for allowed query properties
export const fileQueryResolver = resolve<FileQuery, FileServiceHookContext>({
    schema: $fileQuery,
    validate: `before`,
    properties: {
        //
    }
})

// Export all resolvers in a format that can be used with the resolveAll hook
const fileResolveAll = {
    result: fileResolver,
    dispatch: fileDispatchResolver,
    data: {
        create: fileCreateResolver,
        update: filePatchResolver,
        patch: filePatchResolver
    },
    query: fileQueryResolver
}

export default fileResolveAll