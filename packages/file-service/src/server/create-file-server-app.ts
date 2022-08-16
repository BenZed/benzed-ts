
import { createMongoApplication, MongoApplication, MongoApplicationConfig } from '@benzed/feathers'

import services from './services'
import middleware from './middleware'

/*** Types ***/

// eslint-disable-next-line @typescript-eslint/no-empty-interface
type FileServerConfig = MongoApplicationConfig

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileServices { }

type FileServerApp = MongoApplication<FileServices, FileServerConfig>

/*** Main ***/

function createFileServerApp(): FileServerApp {

    return createMongoApplication({
        services,
        middleware
    })
}

/*** Exports ***/

export default createFileServerApp

export {

    createFileServerApp,

    FileServerApp,
    FileServerConfig,
    FileServices
}
