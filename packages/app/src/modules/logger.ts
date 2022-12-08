
import { Logger as _Logger, LoggerOptions } from '@benzed/util'
import { SettingsModule } from '../module'

//// Types ////

interface LoggerSettings extends Omit<LoggerOptions, 'header'> {}

//// Main ////

class Logger extends SettingsModule<LoggerSettings> {

    static create(options: LoggerSettings): Logger {
        return new Logger(options)
    }

    private constructor(
        options: LoggerSettings
    ) {
        super(options)
        this._log = _Logger.create(options)
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