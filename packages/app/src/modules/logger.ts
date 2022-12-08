
import { Logger as _Logger, LoggerOptions, PartialOptional } from '@benzed/util'
import { SettingsModule } from '../module'

////  ////

const DEFAULT_CACHE_LENGTH = 1000

//// Types ////

interface LoggerSettings extends Omit<LoggerOptions, 'header'> {
    
    /**
     * Number of logs to keep in the cache.
     */
    cacheLength: number
}

//// Main ////

class Logger extends SettingsModule<LoggerSettings> {

    static create(options: PartialOptional<LoggerSettings, 'cacheLength' | 'timeStamp'>): Logger {
        return new Logger({
            timeStamp: true,
            cacheLength: DEFAULT_CACHE_LENGTH,
            ...options
        })
    }

    private constructor(
        options: LoggerSettings
    ) {
        super(options)
        this._log = _Logger.create({
            ...options,
            onLog: (...args) => {

                this._logs.push(args)
                while (this._logs.length > this.settings.cacheLength)
                    this._logs.splice(0, 1)
                
                this.settings.onLog(...args)
            }
        })
    }

    private readonly _logs: unknown[][] = []
    get logs(): readonly unknown[][] {
        return this._logs
    }

    private readonly _log: _Logger
    override get log(): _Logger {
        return this._log
    }

    override _validateModules(): void {
        this._assertRoot()
        this._assertSingle()
    }

}

//// Exports ////

export default Logger

export {
    Logger
}