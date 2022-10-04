
import { 
    setupMongoDBService, 
    MongoDBService, 
    MongoDBAdapterParams 
} from '@benzed/feathers'

import type { FileServerApp } from '../../create-file-server-app'

import * as fileHooks from './hooks'

import { 
    File,
    FileData,
    FileQuery
} from './schema'

/*** Types ***/

type FileService = MongoDBService<File, FileData, FileParams>
type FileParams = MongoDBAdapterParams<FileQuery>

/*** Main ***/

// A configure function that registers the service and its hooks via `app.configure`
function setupFileService(app: FileServerApp): void {

    const fileService = setupMongoDBService<File, FileData, FileParams>(
        app,

        // mongo service options
        { 
            collection: 'files' 
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
