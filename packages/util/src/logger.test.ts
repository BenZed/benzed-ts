import { ansiColorTag } from './ansi'
import {
    createLogger,
    Logger,
    LoggerOptions,
    WARN_SYMBOL,
    ERR_SYMBOl
} from './logger'

describe('Logger', () => {

    const createTestLogger = (
        options: Omit<LoggerOptions, 'onLog'> = {}
    ): { log: Logger, logs: unknown[] } => {

        const logs: unknown[] = []

        const log = createLogger({
            ...options,
            onLog: (...args: unknown[]) => {
                logs.push(...args)

                // Comment out when tests are complete.
                console.log(...args)
            }
        })
        return { log, logs }
    }

    it('Accepts a function to defer logs to', () => {
        const { log, logs } = createTestLogger()
        void log`Hello world.`
        expect(logs).toContain('Hello world.')
    })

    it('Can be configured with a header', () => {

        const { log, logs } = createTestLogger({
            header: '!'
        })

        void log`Hey.`

        expect(logs).toContain('!')
    })

    it('Header can be omitted', () => {

        const { log, logs } = createTestLogger()

        void log`Hey.`

        expect(logs).not.toContain(undefined)
    })

    it('Includes timestamp', () => {
        const { log, logs } = createTestLogger()

        void log`Yo.`

        expect(logs[0]).toContain('[')
        expect(logs[0]).toContain(']')
    })

    it('Timestamp can be omitted', () => {
        const { log, logs } = createTestLogger({ timeStamp: false })

        void log`Bruh what's good`

        expect(logs.join('')).toContain('Bruh what\'s good')
    })

    it('Subsequent identical timestamps are greyed out', () => {
        const { log, logs } = createTestLogger({})

        void log`Bruh what's good`
        void log`Ntm`

        expect(logs.join('')).toContain(ansiColorTag('black', true))
    })

    it(`log.warn prefixes ${WARN_SYMBOL} `, () => {
        const { log, logs } = createTestLogger({})

        void log.warn`Uh Oh`

        expect(logs).toContain(WARN_SYMBOL)
    })

    it(`log.error prefixes ${ERR_SYMBOl}`, () => {
        const { log, logs } = createTestLogger({})

        void log.error`Oh No`

        expect(logs).toContain(ERR_SYMBOl)
    })

    it('no color on directly interpolated strings', () => {
        const { log, logs } = createTestLogger()

        void log`This ${'string'} should not be green.`
        expect(logs.join('')).not.toContain(ansiColorTag('green'))
    })

    it('does not log "this" unless it is a string', () => {
        const { log, logs } = createTestLogger()

        const notAString = {
            log,
            property: 'should-be-invisible'
        }

        void notAString.log`Hello!`

        expect(logs.every(l => l !== notAString)).toBe(true)
    })
})