import { MongoDBApplication } from '@benzed/feathers'

import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'

import { FilePayload } from '../schema'
import FileService from '../service'

/*** Main ***/

function uploadComplete(
    ctx: FeathersKoaContext, 
    files: FeathersService<MongoDBApplication, FileService>,
    payload: FilePayload,
): void {

    // 

    ctx.body = 'complete'
}

/*** Exports ***/

export default uploadComplete

export {
    uploadComplete
}