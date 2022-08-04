import {
    Application,
    IdType,
    Params
} from '@benzed/feathers'

import FileService from './service'

import * as hooks from './hooks'

/*** Main ***/

export default function setupFileService<
    I extends IdType,
    P = Params
>(
    app: Application
): FileService<I, P> {

    const service = new FileService(app)

    app.use('/files', service)

    return service
}

/*** Exports ***/

export * from './schema'
export * from './service'
export * from './hooks'
export * from './middleware'