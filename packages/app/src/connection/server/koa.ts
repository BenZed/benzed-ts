import Koa from 'koa'
import { createServer, Server as HttpServer } from 'http'

import Server, { DEFAULT_SERVER_OPTIONS, ServerOptions } from './server'
import { create } from 'domain'

/**
 * Koa is a means to an end. I'd like to keep the implementation as
 * de-coupled from the rest of the app logic as possible. The only 
 * thing interacting with the KOA Api should be this class.
 */
export class KoaServer extends Server {

    private readonly _koa 
    private _http: HttpServer | null = null

    constructor(
        options: ServerOptions = DEFAULT_SERVER_OPTIONS
    ) {
        super(options)
        this._koa = new Koa()
    }

    async start(): Promise<void> {

        if (this._http)
            throw new Error(`${Server.name} already started.`)

        const { _koa: koa, options } = this

        await new Promise<void>(resolve => {
            this._http = koa.listen(options.port, resolve)
        })

    }

    async stop(): Promise<void> {

        const { _http: http } = this

        if (!http)
            throw new Error(`${Server.name} not yet started started.`)
        
        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })
    }

}