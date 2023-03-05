import { is } from '@benzed/is'
import { Trait } from '@benzed/traits'
import { AnyTypeGuard } from '@benzed/util'

import Module from '../module'

//// Main ////

/**
 * Trait modules can implement if they require functionality to execute on start
 */
abstract class Runnable extends Trait {

    static override readonly is: (input: unknown) => input is Runnable = is.shape({
        start: is.function,
        stop: is.function,
        running: is.boolean
    }).strict(false) as AnyTypeGuard

    private _running = false 
    get running() {
        return this._running
    }

    async start() {
        if (this._running)
            throw new Error(`${Module.nameOf(this)} is already running`)

        this._running = true

        await this._onStart()
    }

    async stop() {
        if (!this._running)
            throw new Error(`${Module.nameOf(this)} is not running`)

        await this._onStop()

        this._running = false
    }

    protected abstract _onStart(): void | Promise<void>

    protected abstract _onStop():void | Promise<void>

}

//// Exports ////

export default Runnable

export {
    Runnable
}