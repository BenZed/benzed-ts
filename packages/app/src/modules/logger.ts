
import { LoggerOptions, PartialOptional } from '@benzed/util'
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
    }

    /**
     * @internal
     */
    _pushLog = (...args: unknown[]): void => {
        this._logs.push(args)
        while (this._logs.length > this.settings.cacheLength)
            this._logs.splice(0, 1)
    }

    private readonly _logs: unknown[][] = []
    get logs(): readonly unknown[][] {
        return this._logs
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