import { MongoDBApplication } from '@benzed/feathers'
import { FeathersService } from '@feathersjs/feathers'
import { FeathersKoaContext } from '@feathersjs/koa'

import { FilePayload } from '../schema'
import FileService from '../service'

/*** Main ***/

function serve(
    ctx: FeathersKoaContext,
    files: FeathersService<MongoDBApplication, FileService>,
    fileId: string,
    localDir: string
): void {

    //

    ctx.body = 'serve'
}

/*** Exports ***/

export default serve

export {
    serve
}