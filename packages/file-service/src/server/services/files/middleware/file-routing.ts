import fs from 'fs'

import { MongoDBApplication } from '@benzed/feathers'
import { FeathersService } from '@feathersjs/feathers'
import { Middleware, FeathersKoaContext } from '@feathersjs/koa'

import FileService from '../service'
import { File, FilePayload, FileServiceConfig } from '../schema'
import { DOWNLOAD_QUERY_PARAM, UPLOAD_QUERY_PARAM } from '../constants'

import { isString } from '@benzed/is'

/*** Types ***/

interface FileRoutingMiddlewareSettings {
    path: FileServiceConfig['path']
    fs: FileServiceConfig['fs']
    s3: FileServiceConfig['s3']
    verify: (token: string) => FilePayload | Promise<FilePayload>
}

/*** Helper ***/

function getFileService(
    ctx: FeathersKoaContext
): FeathersService<MongoDBApplication, FileService> {
    return ctx
        .app
        .service('files') as unknown as FeathersService<MongoDBApplication, FileService>
}

/*** Helper ***/

function uploadComplete(
    ctx: FeathersKoaContext, 
    payload: FilePayload
): void {

    ctx.body = 'Complete'
}

function uploadPart(
    ctx: FeathersKoaContext, 
    payload: FilePayload
): void {

    ctx.body = 'Upload'
}

async function serve(
    ctx: FeathersKoaContext
): Promise<void> {

    const id = ctx.query[DOWNLOAD_QUERY_PARAM] as string

    const file = await getFileService(ctx).get(id)

    ctx.body = fs.createReadStream('./tsconfig.json')
}

/*** Main ***/

function createFileRoutingMiddleware(
    { verify, path, fs, s3 }: FileRoutingMiddlewareSettings
): Middleware {

    void fs // TODO check that fs exists 
    void s3 // TODO check that s3 is valid 

    return async (ctx, next) => {

        const isAtPath = ctx.path === path
        
        if (isAtPath && ctx.method === 'PUT' && isString(ctx.query[UPLOAD_QUERY_PARAM])) {

            const token = ctx.query[UPLOAD_QUERY_PARAM]
            const payload = await verify(token)

            return 'complete' in payload.action
                ? uploadComplete(ctx, payload)
                : uploadPart(ctx, payload)
        } 
        
        if (isAtPath && ctx.method === 'GET' && isString(ctx.query[DOWNLOAD_QUERY_PARAM])) 
            return serve(ctx)

        return next()
    }
}

/*** Exports ***/

export default createFileRoutingMiddleware

export {
    createFileRoutingMiddleware,
    FileRoutingMiddlewareSettings
}