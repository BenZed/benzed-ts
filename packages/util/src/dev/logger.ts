import ansi from './ansi'
import { inspect } from 'util'
import { Callable } from '../classes'
import { nil } from '../types'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    no-return-assign
*/

//// Types ////

type TimeStamp = boolean // TODO add month/day?

interface LoggerOptions {

    /**
     * First argument to any log. 
     * 
     * ```ts
     * const logger = new Logger({ header: '😃', timeStamp: false })
     * 
     * log`Hello World`
     * 
     * // '😃 Hello World'
     * ```
     */
    header: string

    /**
     * Include a timestamp
     * 
     * ```ts
     * const logger = new Logger({ timeStamp: true })
     * 
     * log`Hello World`
     * 
     * // '😃 Hello World'
     * ```
     */
    timeStamp: TimeStamp

    /**
     * console.log by default.
     */
    onLog: LogHandler

}

type Log = (strings: TemplateStringsArray, ...inputs: unknown[]) => void

type LogHandler = (...items: unknown[]) => void

interface Logger extends Log {
    options: LoggerOptions
    info: Log
    error: Log
    warn: Log
}

interface LoggerConstructor {
    create(options: Partial<LoggerOptions>): Logger
    is: typeof isLogger
}

type Icon = typeof WARN_ICON | typeof ERR_ICON | nil

//// Constants ////

const WARN_ICON = '⚠️'

const ERR_ICON = '‼️'

const INPECT_DEPTH = 3

//// Helper ////

function digits(input: number, count: number): string {
    return input.toString().padStart(count, '0')
}

function createTimeStamp(date: Date): string {

    const hours = date.getHours()
    const minutes = digits(date.getMinutes(), 2)
    const seconds = digits(date.getSeconds(), 2)

    return `[${hours}:${minutes}:${seconds}]`
}

function colorTimeStamp(
    timeStamp: string,
    lastTimeStamp: string,
    status: Icon
): string {

    if (status) {

        const isErr = status === ERR_ICON
        const color = isErr ? 'red' : 'yellow'

        return ansi(timeStamp, { color, inverted: true })
    }

    if (timeStamp === lastTimeStamp)
        return ansi(timeStamp, { intensity: 'dim' })

    return timeStamp
}

function isLogger(input: unknown): input is Logger {
    return typeof input === 'function' &&
        typeof (input as Logger).error === 'function' &&
        typeof (input as Logger).warn === 'function' &&
        (input as Logger).info === input
}

//// Main ////

const Logger = class extends Callable<(strings: readonly string[], ...params: unknown[]) => void> {

    static is = isLogger 

    static override create(options: Partial<LoggerOptions>): Logger {
        return new this({
            header: '',
            onLog: console.log.bind(console),
            timeStamp: true,
            ...options
        })
    }

    constructor(
        readonly options: LoggerOptions
    ) {
        super((strings, ...params) => this.info(strings, ...params))
    }

    private _lastTimeStamp = ''

    private _error: Log | nil = nil
    get error(): Log {
        const _this = this
        return this._error ??= _this.info.bind({
            get options(): LoggerOptions {
                return _this.options
            },
            get _lastTimeStamp(): string {
                return _this._lastTimeStamp
            },
            set _lastTimeStamp(value: string) {
                _this._lastTimeStamp = value
            },
            status: ERR_ICON
        })
    }

    private _warn: Log | nil = nil
    get warn(): Log {
        const _this = this
        return this._warn ??= this.info.bind({
            get options(): LoggerOptions {
                return _this.options
            },
            get _lastTimeStamp(): string {
                return _this._lastTimeStamp
            },
            set _lastTimeStamp(value: string) {
                _this._lastTimeStamp = value
            },
            status: WARN_ICON
        })
    }

    info(
        strings: readonly string[],
        ...inputs: unknown[]
    ): void {

        const { status } = this as (typeof this & { status: Icon })

        const outputs: unknown[] = []
        for (let i = 0; i < strings.length; i++) {
            const string = strings[i]

            outputs.push(string)
            if (i in inputs) {
                outputs.push(
                    typeof inputs[i] === 'string'
                        ? inputs[i]
                        : inspect(inputs[i], false, INPECT_DEPTH, true)
                )
            }
        }

        const prefix: string[] = []

        if (this.options.header)
            prefix.push(this.options.header)

        if (this.options.timeStamp) {
            const timeStamp = createTimeStamp(new Date())

            prefix.push(
                colorTimeStamp(
                    timeStamp,
                    this._lastTimeStamp,
                    status
                )
            )

            this._lastTimeStamp = timeStamp
        }

        if (status)
            prefix.push(status)

        this.options.onLog?.(...prefix, outputs.join(''))
    }

} as LoggerConstructor 

//// Exports ////

export default Logger

export {

    Logger,
    isLogger,

    LoggerOptions,

    LogHandler,

    WARN_ICON,
    ERR_ICON
}