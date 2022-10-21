import { inspect } from 'util'
import isArrayLike from './is-array-like'

/*** DATA ***/

class CustomTypeWithLength {
    length = 5
}

class CustomTypeWithoutLength {

    *[Symbol.iterator](): Generator<number> {
        for (let i = 0; i < this.size; i++)
            yield i
    }

    size = 5
}

const ARRAY_LIKES = [
    [1, 2, 3],
    { length: 0 },
    new Int8Array(5),
    Buffer.alloc(5, 64),
    new String('foobar'), // eslint-disable-line
    new CustomTypeWithLength()
]

const ARRAY_UNLIKES = [
    new Date(),
    /length-regex/g,
    5,
    true,
    Symbol(`symbols-arn't-array-like`),
    { size: 10 },
    new Map(),
    new Set(),
    new CustomTypeWithoutLength()
]

/*** Tests ***/

describe(`returns true if an object is array-like`, function () {

    // eslint-disable-next-line
    const arg = arguments

    for (const value of [...ARRAY_LIKES, arg]) {
        it(
            `${value === arg ? `<arguments>` : inspect(value)} is array-like`,
            () => expect(isArrayLike(value)).toEqual(true)
        )
    }

})

describe(`returns false if object is not an arraylike`, () => {
    for (const value of [...ARRAY_UNLIKES, `foobar`]) {
        it(
            `${inspect(value)} is not array-like`,
            () => expect(isArrayLike(value)).toEqual(false)
        )
    }
})
