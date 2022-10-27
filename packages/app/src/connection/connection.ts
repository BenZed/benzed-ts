
import { AppModule, AppModules } from '../app-module'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object = object> extends AppModule {

    protected _validateComponents(): void {
        this._assertSingle()
    }

    abstract readonly type: `server` | `client` | null

    private _started = false
    get active(): boolean {
        return this._started
    }

    constructor(
        modules: AppModules,
        public options: O
    ) {
        super(modules)
    }

    start(): void | Promise<void> {
        if (this._started) {
            throw new Error(
                `${this.type} has already been started`
            )
        }
        this._started = true
    }

    stop(): void | Promise<void> {
        if (!this._started) {
            throw new Error(
                `${this.type} has not been started`
            )
        }
        this._started = false
    }

}

export default Connection