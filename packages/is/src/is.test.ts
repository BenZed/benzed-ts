import is from './is'

import { inspect } from 'util'

import { isDefined } from './is-basic'
import isArrayOf from './is-array-of'
import isPlainObject from './is-plain-object'

/*** Types ***/

interface TestEachValueConfig {
    title: string
    test
    result
}

/*** Data ***/

class Foo { }

const SHORTCUTS = [
    'string',
    'number',
    'bool',
    'object',
    'func',
    'symbol',
    'array',
    'date',
    'promise',
    'primitive',
    'nan',
    'plainObject',
    'instanceable',
    'defined',
    'truthy',
    'falsy'
]

const TYPES = {
    string: String,
    number: Number,
    bool: Boolean,
    func: Function,
    object: Object,
    array: Array,
    date: Date,
    promise: Promise,
    symbol: Symbol,
    primitive: [String, Boolean, Number]
}

const VALUES = [
    'string',
    100,
    0,
    -1,
    Infinity,
    NaN,
    true,
    undefined,
    null,
    function () { /* empty */ },
    Symbol('symbol'),
    Promise.resolve(true),
    [],
    {},
    { foo: 'bar' },
    { true: true },
    { false: false },
    { zero: 0, one: 1 },
    ...Object.values(TYPES),
    Foo,
    new Foo(),
    new Date(),
    {
        now: new Date()
    }
]

const ARRAY_VALUES = [
    ...VALUES,
    ...VALUES.map(v => [v])
]

/*** Helper ***/

function testEachValue({ title, test, result }: Readonly<TestEachValueConfig>): void {
    describe(title, () => {

        let atLeastOneFalse = false
        let atLeastOneTrue = false

        for (const value of ARRAY_VALUES) {
            if (result(value))
                atLeastOneTrue = true
            else
                atLeastOneFalse = true

            it(`${inspect(value)} === ${result(value)}`, () => {
                expect(test(value)).toBe(result(value))
            })
        }

        if (!atLeastOneFalse)
            throw new Error(title + ' did not have a value that returned false')

        if (!atLeastOneTrue)
            throw new Error(title + ' did not have a value that returned true')
    })
}

describe('is() shortcuts give same output as counterparts', () => {
    for (const key in TYPES) {
        testEachValue({
            title: `is.${key}`,
            test: is[key],
            result: value => is(value, TYPES[key])
        })

        testEachValue({
            title: `is.arrayOf.${key}`,
            test: is.arrayOf[key],
            result: value => is.arrayOf(value, TYPES[key])
        })

        testEachValue({
            title: `is.arrayOf(value, ${TYPES[key]})`,
            test: value => is.arrayOf(value, TYPES[key]),
            result: value => isArrayOf(value, TYPES[key])
        })
    }
})

describe('exotic shortcuts', () => {

    testEachValue({
        title: 'is.defined',
        test: is.defined,
        result: isDefined
    })

    testEachValue({
        title: 'is.plainObject',
        test: is.plainObject,
        result: isPlainObject
    })

    testEachValue({
        title: 'is.nan',
        test: is.nan,
        result: Number.isNaN
    })

    testEachValue({
        title: 'is.truthy',
        test: is.truthy,
        result: value => !!value
    })

    testEachValue({
        title: 'is.falsy',
        test: is.falsy,
        result: value => !value
    })

    for (const shortcut of SHORTCUTS) {
        testEachValue({
            title: `is.arrayOf.${shortcut}`,
            test: is.arrayOf[shortcut],
            result: value => is.array(value) && value.length > 0 && value.every(is[shortcut])
        })
    }

})
