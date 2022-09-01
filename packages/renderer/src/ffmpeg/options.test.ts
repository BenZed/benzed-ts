import { isSizeOptions, isTimeOptions } from './options'

describe('isTimeOptions method', () => {

    for (const [obj, result] of [
        [{ progress: 10 }, true],
        [{ seconds: 0 }, true],
        [{ seconds: '123' }, false],
        [{ progress: null }, false],
        [{ progress: undefined }, false],
        [{ seconds: undefined }, false],
        [{}, false]
    ]) {
        it(`${JSON.stringify(obj)} ${result ? 'pass' : 'fail'}`, () => {
            expect(isTimeOptions(obj)).toBe(result)
        })
    }
})

describe('isSizeOptions method', () => {
    for (const [obj, result] of [
        [{ width: 10 }, true],
        [{ height: 10 }, true],
        [{ width: true }, false],
        [{ height: true }, false],
        [{ height: 5, width: 5 }, true],
        [{ height: 5 }, true],
        [{ height: null }, false],
        [{ height: 'full', width: null }, false],
        [{ dimensions: 100 }, true],
        [{ dimensions: null }, false],
        [{ scale: 0.5 }, true],
        [{ scale: null }, false],
        [{}, false]
    ]) {
        it(`${JSON.stringify(obj)} ${result ? 'pass' : 'fail'}`, () => {
            expect(isSizeOptions(obj)).toBe(result)
        })
    }
})