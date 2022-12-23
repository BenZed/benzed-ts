
import { Modules } from '@benzed/ecs'
import { 
    LoggerOptions, 
    PartialOptional 
} from '@benzed/util'

import { AppModule } from '../app-module'

//// Defaults ////

const DEFAULT_CACHE_LENGTH = 1000

//// Types ////

interface LoggerSettings extends Omit<LoggerOptions, 'header'> {
    
    /**
     * Number of logs to keep in the cache.
     */
    cacheLength: number
}

//// Main ////

class Logger extends AppModule<LoggerSettings> {

    static create(options: PartialOptional<LoggerSettings, 'cacheLength' | 'timeStamp'>): Logger {
        return new Logger({
            timeStamp: true,
            cacheLength: DEFAULT_CACHE_LENGTH,
            ...options
        })  
    }

    /**
     * @internal
     */
    _pushLog = (...args: unknown[]): void => {
        this._logs.push(args)
        while (this._logs.length > this.data.cacheLength)
            this._logs.splice(0, 1)
    }

    private readonly _logs: unknown[][] = []
    get logs(): readonly unknown[][] {
        return this._logs
    }

    override validate(): void {
        Modules.assert.isRootLevel(this)
        Modules.assert.isSingle(this)
    }

}

//// Exports ////

export default Logger

export {
    Logger
}