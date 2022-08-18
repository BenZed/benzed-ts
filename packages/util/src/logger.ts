import ansi from './ansi'
import { inspect } from 'util'

/*** Types ***/

type Log = (strings: TemplateStringsArray, ...inputs: unknown[]) => void

type Logger = Log & {
    info: Log
    error: Log
    warn: Log
}

type TimeStamp = boolean // TODO add month/day?

type LoggerOptions = {

    /**
     * First argument to any log. 
     * 
     * ```ts
     * const logger = createLogger({ header: '😃', timeStamp: false })
     * 
     * log`Hello World`
     * 
     * // '😃 Hello World'
     * ```
     */
    header?: string

    /**
     * Include a timestamp
     * 
     * ```ts
     * const logger = createLogger({ timeStamp: true })
     * 
     * log`Hello World`
     * 
     * // '😃 Hello World'
     * ```
     */
    timeStamp?: TimeStamp

    /**
     * console.log by default.
     */
    onLog?: LogHandler

}

type LogHandler = (...items: unknown[]) => void

/*** Constants ***/

const WARN_SYMBOL = '⚠️'

const ERR_SYMBOl = '‼️'

const INPECT_DEPTH = 3

/*** Helper ***/

function twoDigit(input: number, count = 2): string {
    return input.toString().padStart(count, '0')
}

function createTimeStamp(date: Date): string {

    const hours = date.getHours()
    const minutes = twoDigit(date.getMinutes())
    const seconds = twoDigit(date.getSeconds())

    return `[${hours}:${minutes}:${seconds}]`
}

function colorTimeStamp(
    timeStamp: string,
    lastTimeStamp: string,
    status: typeof WARN_SYMBOL | typeof ERR_SYMBOl | void
): string {

    if (status) {

        const isErr = status === ERR_SYMBOl
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

/*** Main ***/

const createLogger =
    (
        options: LoggerOptions = {}
    ): Logger => {

        const {
            header,
            timeStamp: includeTimeStamp = true,
            onLog = console.log.bind(console),
        } = options

        let lastTimeStamp = ''

        const log: Logger = function (
            this: typeof WARN_SYMBOL | typeof ERR_SYMBOl | void,
            strings,
            ...inputs
        ): void {

            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const status = typeof this === 'string' ? this : undefined

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

            if (header)
                prefix.push(header)

            if (includeTimeStamp) {
                const timeStamp = createTimeStamp(new Date())

                prefix.push(
                    colorTimeStamp(
                        timeStamp,
                        lastTimeStamp,
                        status
                    )
                )

                lastTimeStamp = timeStamp
            }

            if (status)
                prefix.push(status)

            onLog(...prefix, outputs.join(''))
        }

        log.info = log
        log.error = log.bind(ERR_SYMBOl)
        log.warn = log.bind(WARN_SYMBOL)

        return log
    }

/*** Exports ***/

export default createLogger

export {
    createLogger,

    Logger,
    isLogger,

    LoggerOptions,

    LogHandler,

    WARN_SYMBOL,
    ERR_SYMBOl
}