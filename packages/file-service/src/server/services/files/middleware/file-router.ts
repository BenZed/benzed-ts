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

interface FileRoutingSettings {

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

    if (!fsConfig) {
        throw new Error(
            `fs configuration invalid: ${fsConfig}`
        )
    }
}

/*** Main ***/

function fileRouter(
    { 
        verify, 
        path, 
        fs: fsConfig, 
        s3: s3Config 
    }: FileRoutingSettings
): Middleware {

    void s3Config // TODO check that s3 is valid 

    assertFsConfig(fsConfig)

    return async (ctx, toServiceRoutes) => {

        const isAtPath = ctx.path === path
        if (isAtPath) {

            const uploadToken = ctx.query[UPLOAD_QUERY_PARAM]
            const downloadId = ctx.query[DOWNLOAD_QUERY_PARAM]

            const files = getFileService(ctx, path)

            const payload = isString(uploadToken)
                ? await verify(uploadToken)
                : null

            if (ctx.method === 'POST' && payload) 
                return uploadComplete(ctx, files, payload, fsConfig)

            if (ctx.method === 'PUT' && payload) 
                return uploadPart(ctx, files, payload, fsConfig)

            if (ctx.method === 'GET' && isString(downloadId)) 
                return serve(ctx, files, downloadId, fsConfig)
        }

        if (ctx.body === undefined)
            await toServiceRoutes()

    }
}

/*** Exports ***/

export default fileRouter

export {
    fileRouter,
    FileRoutingSettings
}