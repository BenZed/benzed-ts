import { Module } from '@benzed/ecs'
import { nil, toVoid, Logger } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types 
*/

//// Constants ////  

/**
 * Allow the use of the .log api without breaking any modules in
 * the event that logging is not enabled.
 */
const DUMMY_LOGGER = Logger.create({ onLog: toVoid })

//// Types ////

export type AppModules = readonly AppModule[]

export class AppModule<D = unknown> extends Module<D> {

    //// Module Interface ////

    private get _icon(): string {
        type Iconable = { icon?: string }
        return (this as Iconable)?.icon ?? 
            (this.constructor as Iconable)?.icon ?? ''
    }

    private _log: Logger | nil = nil
    get log(): Logger {
        if (!this._log) {

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const LoggerModule = require('./app-modules/logger').Logger
        
            const logger = this.hasNode && this.node.findModule.inAncestors(LoggerModule)

            this._log = logger 
                ? Logger.create({
                    ...logger.data,
                    header: this._icon,
                    onLog: (...args) => {
                        logger._pushLog(...args)
                        logger.data.onLog(...args)
                    }
                })
                : DUMMY_LOGGER
        }
        return this._log
    }

    //// Lifecycle Hooks ////

    /**
     * True if this module has been started, false otherwise.
     */
    get active() : boolean {
        return this._active
    }
    private _active = false

    start(): void | Promise<void> {
        this._assertStopped()
        this._active = true
    }

    stop(): void | Promise<void> {
        this._assertStarted()
        this._active = false
    }

    //// Validation ////

    protected _assertStarted(): void {
        if (!this.active) {
            throw new Error(
                `${this.name} has not been started`
            )
        }
    }

    protected _assertStopped(): void {
        if (this.active) {
            throw new Error(
                `${this.name} has already been started`
            )
        }
    }
}