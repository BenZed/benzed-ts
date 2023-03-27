import Koa from 'koa'
import serve from 'koa-static'

import path from 'path'

import { Logger } from '@benzed/logger'

//// App ////

class Server {

    private readonly _koa: Koa
    
    readonly log: Logger

    constructor() {

        const PUBLIC = path.resolve(__dirname, '../public')

        this._koa = new Koa
        this._koa.use(
            serve(PUBLIC)
        )

        this.log = new Logger({ timeStamp: true })
    }

    start(port: number) {
        this._koa.listen(port)
        this.log`server started on ${port}`
    }

}

//// Exports ////

export {
    Server
}