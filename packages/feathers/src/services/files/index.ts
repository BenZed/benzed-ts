import { Application } from '../../types'
import FileService from './service'

import * as hooks from './hooks'

/*** Main ***/

export default function setupFileService(app: Application): FileService {

    const service = new FileService(app)

    app.use('/files', service)

    return service
}

/*** Exports ***/

export * from './schema'
export * from './service'
export * from './hooks'
export * from './middleware'