import { Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import cors from '@koa/cors'

import { Compute } from '@benzed/ecs'

import Server, { ServerOptions } from './server'
import type { Command, CommandResult } from '../../command'
import type { AppModules } from '../../app-module'

/*** Helper ***/

/*** KoaServer ***/

/**
 * Koa is a means to an end. I'd like to keep the implementation as
 * de-coupled from the rest of the app logic as possible. The only 
 * thing interacting with the KOA Api should be this class.
 * 
 * I mean, Koa is great, I don't think I'll ever build my own 
 * http server request/response parser, but still.
 */
export class KoaServer extends Server {

    static withOptions(options: ServerOptions, compute: Compute<Command, CommandResult | Promise<CommandResult>>): new (m: AppModules) => KoaServer {
        return class extends KoaServer {
            constructor (
                components: AppModules,
            ) {
                super(components, options, compute)
            }
        }
    }

    private readonly _koa 
    private _http: HttpServer | null = null

    constructor(
        components: AppModules,
        options: ServerOptions,
        readonly compute: Compute<Command, CommandResult | Promise<CommandResult>>
    ) {
        super(components, options)

        this._koa = new Koa()
        this._koa.use(cors())
        this._koa.use(async (ctx, next) => {
            await next()
            ctx.body = this._isInfoRequest(ctx)
                ? { version: `0.0.1`, name: `benzed-ecs-app` }
                : await this.compute(
                    this._commandFromCtx(ctx)
                )
        })
    }

    private _isInfoRequest(ctx: Context): boolean {
        return ctx.method.toLowerCase() === `options` && this._splitUrl(ctx).length === 0
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }

    private _commandFromCtx(ctx: Context): Command {

        const name = this._splitUrl(ctx).at(0)
        if (!name)
            throw new Error(`${ctx.url} ${ctx.method} is an invalid command`)

        return { name }
    }

    async start(): Promise<void> {

        await super.start()
        const { _koa: koa, options } = this

        await new Promise<void>(resolve => {
            this._http = koa.listen(options.port, resolve)
        })
    }

    async stop(): Promise<void> {
        await super.stop()

        const http = this._http as HttpServer
        
        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })
    }

}