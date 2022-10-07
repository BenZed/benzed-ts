import fs from '@benzed/fs'
import { isString } from '@benzed/is'
import { MongoDBApplication } from '@benzed/feathers'

import { FeathersService } from '@feathersjs/feathers'
import { Middleware, FeathersKoaContext } from '@feathersjs/koa'

import FileService from '../service'
import { FilePayload, FileServiceConfig } from '../schema'
import { DOWNLOAD_QUERY_PARAM, UPLOAD_QUERY_PARAM } from '../constants'

import uploadComplete from './upload-complete'
import uploadPart from './upload-part'
import serve from './serve'

/*** Types ***/

interface FileRoutingMiddlewareSettings {

    fs: FileServiceConfig['fs']
    s3: FileServiceConfig['s3']
    path: FileServiceConfig['path']
    verify: (token: string) => FilePayload | Promise<FilePayload>

}

/*** Helper ***/

function getFileService(
    ctx: FeathersKoaContext,
    path: string
): FeathersService<MongoDBApplication, FileService> {
    return ctx
        .app
        .service(path) as unknown as FeathersService<MongoDBApplication, FileService>
}

function assertFsConfig(
    fsConfig: FileServiceConfig['fs']
): asserts fsConfig is string {

    try {
        const stat = fsConfig && fs.sync.stat(fsConfig)
        if (!stat || !stat.isDirectory())
            throw new Error('Not a directory.')
    } catch {
        throw new Error(
            `fs configuration invalid: ${fsConfig}`
        )
    }
}

/*** Main ***/

function createFileHandlingMiddleware(
    { 
        verify, 
        path, 
        fs: fsConfig, 
        s3: s3Config 
    }: FileRoutingMiddlewareSettings
): Middleware {

    void s3Config // TODO check that s3 is valid 

    assertFsConfig(fsConfig)

    return async (ctx, next) => {

        const isAtPath = ctx.path === path
        if (isAtPath) {

            const files = getFileService(ctx, path)
            const uploadToken = ctx.query[UPLOAD_QUERY_PARAM]
            const downloadId = ctx.query[DOWNLOAD_QUERY_PARAM]

            if (ctx.method === 'PUT' && isString(uploadToken)) {

                const payload = await verify(uploadToken)

                return 'complete' in payload.action
                    ? uploadComplete(ctx, files, payload)
                    : uploadPart(ctx, files, payload, fsConfig)
            } 

            if (ctx.method === 'GET' && isString(downloadId)) 
                return serve(ctx, files, downloadId, fsConfig)

        }

        return next()
    }
}

/*** Exports ***/

export default createFileHandlingMiddleware

export {
    createFileHandlingMiddleware,
    FileRoutingMiddlewareSettings
}