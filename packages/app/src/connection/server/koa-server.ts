import { Server as HttpServer } from 'http'

import Koa from 'koa'

import Server, { ServerOptions } from './server'
import { Command, CommandResult } from '../../command'

/**
 * Koa is a means to an end. I'd like to keep the implementation as
 * de-coupled from the rest of the app logic as possible. The only 
 * thing interacting with the KOA Api should be this class.
 * 
 * I mean, Koa is great, I don't think I'll ever build my own 
 * http server request/response parser, but still.
 */
export class KoaServer extends Server {

    private readonly _koa 
    private _http: HttpServer | null = null

    constructor(
        options?: ServerOptions
    ) {
        super(options)
        this._koa = new Koa()
    }

    command(command: Command): Promise<CommandResult> {
        return Promise.resolve(command)
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