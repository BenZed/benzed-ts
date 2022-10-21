import {
    isArray,
    isBigInt,
    isBoolean,
    isDate,
    isDefined,
    isFalsy,
    isFunction,
    isNaN,
    isNumber,
    isObject,
    isPromise,
    isSortable,
    isString,
    isSymbol,
    isTruthy
} from './is-basic'

// TODO write these 

describe(`isString`, () => {
    for (const [input, result] of [
        [`str`, true],
        [``, true],
        [new String(`str`), true],
        [true, false],
        [0, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(`str`), false],
    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isString(input)).toBe(result)
        })
    }
})

describe(`isBoolean`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Boolean(false), true],
        [true, true],
        [0, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(true), false],

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isBoolean(input)).toBe(result)
        })
    }
})

describe(`isNumber`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), true],
        [NaN, false],
        [true, false],
        [0, true],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(100), false],

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isNumber(input)).toBe(result)
        })
    }
})

describe(`isSymbol`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [true, false],
        [0, false],
        [Symbol(), true],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(Symbol()), false],

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isSymbol(input)).toBe(result)
        })
    }
})

describe(`isNaN`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [NaN, true],
        [true, false],
        [0, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(NaN), false],

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isNaN(input)).toBe(result)
        })
    }
})

describe(`isBigInt`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, true],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(100n), false],

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isBigInt(input)).toBe(result)
        })
    }
})

describe(`isObject`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), true],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{ plain: true }, true],
        [[`array`, `of`, `str`], true],
        [null, false],
        [undefined, false],
        [Promise.resolve({}), true]
    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isObject(input)).toBe(result)
        })
    }
})

describe(`isArray`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], true],
        [null, false],
        [undefined, false],
        [Promise.resolve([]), false]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isArray(input)).toBe(result)
        })
    }
})

describe(`isFunction`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, true],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(decodeURI), false]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isFunction(input)).toBe(result)
        })
    }
})

describe(`isPromise`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(decodeURI), true]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isPromise(input)).toBe(result)
        })
    }
})

describe(`isDate`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, false],
        [new Number(0), false],
        [NaN, false],
        [true, false],
        [0, false],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(decodeURI), false],
        [new Date(), true]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isDate(input)).toBe(result)
        })
    }
})

describe(`isTruthy`, () => {
    for (const [input, result] of [
        [`str`, true],
        [``, false],
        [new Number(0), true],
        [NaN, false],
        [true, true],
        [0, false],
        [100n, true],
        [Symbol(), true],
        [function () { /*blank*/ }, true],
        [{}, true],
        [[], true],
        [null, false],
        [undefined, false],
        [Promise.resolve(decodeURI), true],
        [new Date(), true]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isTruthy(input)).toBe(result)
        })
    }
})

describe(`isFalsy`, () => {
    for (const [input, result] of [
        [`str`, false],
        [``, true],
        [new Number(0), false],
        [NaN, true],
        [true, false],
        [0, true],
        [100n, false],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [[], false],
        [null, true],
        [undefined, true],
        [Promise.resolve(decodeURI), false],
        [new Date(), false]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isFalsy(input)).toBe(result)
        })
    }
})

describe(`isSortable`, () => {
    for (const [input, result] of [
        [`str`, true],
        [``, true],
        [new Number(0), true],
        [NaN, false],
        [true, false],
        [0, true],
        [100n, true],
        [Symbol(), false],
        [function () { /*blank*/ }, false],
        [{}, false],
        [{
            valueOf() {
                return 10
            }
        }, true],
        [[], false],
        [null, false],
        [undefined, false],
        [Promise.resolve(decodeURI), false],
        [new Date(), true]

    ] as [unknown, boolean][]) {
        it(`${String(input)} === ${result}`, () => {
            expect(isSortable(input)).toBe(result)
        })
    }
})

describe(`isDefined`, () => {

    it(`isDefined(undefined) == false`, () => expect(isDefined(undefined)).toEqual(false))
    it(`isDefined(null)      == false`, () => expect(isDefined(null)).toEqual(false))
    it(`isDefined(NaN)       == false`, () => expect(isDefined(NaN)).toEqual(false))
    it(`isDefined(10)        == true`, () => expect(isDefined(10)).toEqual(true))
    it(`isDefined(false)     == true`, () => expect(isDefined(false)).toEqual(true))

})
