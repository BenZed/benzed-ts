import { onTimeout, onInterval, onAnimationFrame } from './on-timeout'
import { milliseconds } from './milliseconds'

import { describe, test, expect } from '@jest/globals'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/explicit-function-return-type
*/

//// Tests ////

describe('onTimeout', () => {
    test('should execute the callback after the specified timeout', async () => {
        let count = 0
        const callback = () => count++
        const timeout = 10
        const abort = onTimeout(callback, timeout)
        await milliseconds(20)
        expect(count).toBe(1)
        abort()
    })
})

describe('onInterval', () => {
    test('should execute the callback on the specified interval', async () => {
        let count = 0
        const callback = () => count++
        const interval = 10
        const abort = onInterval(callback, interval)
        await milliseconds(20)
        expect(count).toBeGreaterThan(0)
        abort()
    })
})

describe('onAnimationFrame', () => {
    test('should execute the callback when the next animation frame is ready', async () => {
        let count = 0
        const callback = () => count++
        const abort = onAnimationFrame(callback)
        await milliseconds(20)
        expect(count).toBe(1)
        abort()
    })
})