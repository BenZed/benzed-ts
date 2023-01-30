import { $undefined } from './undefined'

import { test, expect } from '@jest/globals'

import { testValidator } from '../../util.test'

//// Tests ////

test('isValue', () => {
    expect($undefined(undefined)).toBe(undefined)
    expect(() => $undefined(10)).toThrow('Must be undefined')
}) 

testValidator(
    $undefined,
    { input: undefined, outputSameAsInput: true },
    { input: null, error: 'Must be undefined' },
    { input: NaN, error: 'Must be undefined' },
    { input: 1, error: 'Must be undefined' },
    { input: true, error: 'Must be undefined' },
)

testValidator(
    $undefined.error('Must be nothing'),
    'error option',
    { input: null, error: 'Must be nothing' },
)

testValidator(
    $undefined.named('nothing'),
    'name option',
    { input: null, error: 'Must be nothing' },
)