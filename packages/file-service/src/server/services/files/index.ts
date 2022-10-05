
import { 
    setupMongoDBService, 
    MongoDBAdapterParams, 
    MongoDBApplication
} from '@benzed/feathers'

import { Service } from '@feathersjs/feathers'

import * as fileHooks from './hooks'

import { 
    File,
    FileData,
    FileQuery
} from './schema'

/*** Types ***/

type FileParams = MongoDBAdapterParams<FileQuery>
type FileService = Service<File, Partial<FileData>, FileParams>

/*** Main ***/

// A configure function that registers the service and its hooks via `app.configure`
function setupFileService<A extends MongoDBApplication>(app: A): void {

    const paginate = app.get('pagination')

    const fileService = setupMongoDBService<File, FileData, FileParams>(
        app,

        // mongo service options
        { 
            collection: 'files' ,
            paginate
        },

        // feathers service options
        {
            methods: ['create', 'find', 'get', 'patch', 'remove'],

            // You can add additional custom events to be sent to clients here
            events: []
        }
    )

    fileService.hooks(fileHooks)
}

/*** Exports ***/

export default setupFileService

export {
    FileService,
    FileParams 
}

export * from './hooks'
export * from './middleware'
export * from './schema'
