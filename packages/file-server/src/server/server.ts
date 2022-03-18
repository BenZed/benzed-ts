import { feathers } from '@feathersjs/feathers'
import { koa, errorHandler, bodyParser, rest, Application } from '@feathersjs/koa'

/*** Main ***/

class FileServer {

    public readonly app: Application

    public constructor () {

        //
        this.app = koa(feathers())

        this.app.use(errorHandler())
        this.app.use(bodyParser())
        this.app.use(rest())
    }

}

/*** Exports ***/

export default FileServer

export {
    FileServer
}