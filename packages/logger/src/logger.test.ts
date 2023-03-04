
import {
    Logger,
    LoggerOptions,
    WARN_ICON,
    ERR_ICON
} from './logger'

import { describe, it, expect } from '@jest/globals'
import { ansi, ansiColorTag, ANSI_UTIL_TAGS } from '@benzed/util'

describe('Logger', () => {

    const createTestLogger = (
        options: Omit<LoggerOptions, 'onLog'> = {}
    ): { log: Logger, logs: unknown[] } => {

        const logs: unknown[] = []

        const log = new Logger({
            ...options,
            onLog: (...args: unknown[]) => {
                logs.push(...args)

                // Comment out when tests are complete.
                // console.log(...args)
            } 
        })
        return { log, logs }
    }

    it('Accepts a function to defer logs to', () => {
        const { log, logs } = createTestLogger()
        log`Hello world.`
        expect(logs).toContain('Hello world.')
    })

    it('Can be configured with a header', () => {

        const { log, logs } = createTestLogger({
            header: '!'
        })

        log`Hey.`

        expect(logs).toContain('!')
    })

    it('Header can be omitted', () => {

        const { log, logs } = createTestLogger()

        log`Hey.`

        expect(logs).not.toContain(undefined)
    })

    it('Includes timestamp', () => {
        const { log, logs } = createTestLogger()

        log`Yo.`

        expect(logs[0]).toContain('[')
        expect(logs[0]).toContain(']')
    })

    it('Timestamp can be omitted', () => {
        const { log, logs } = createTestLogger({ timeStamp: false })

        log`Bruh what's good`

        expect(logs.join('')).toContain('Bruh what\'s good')
    })

    it('Subsequent identical timestamps are greyed out', () => {
        const { log, logs } = createTestLogger({})

        log`Bruh what's good`
        log`Ntm`
        log`Nice`

        expect(logs.join('')).toContain(ANSI_UTIL_TAGS.dim)
    })

    it(`log.warn prefixes ${WARN_ICON} `, () => {
        const { log, logs } = createTestLogger({})

        log.warn`Uh Oh`

        expect(logs).toContain(WARN_ICON)
    })

    it(`log.error prefixes ${ERR_ICON}`, () => {
        const { log, logs } = createTestLogger({})

        log.error`Oh ${ansi('No', { italic: true })}`

        expect(logs).toContain(ERR_ICON)
    })

    it('no color on directly interpolated strings', () => {
        const { log, logs } = createTestLogger()

        log`This ${'string'} should not be green.`
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