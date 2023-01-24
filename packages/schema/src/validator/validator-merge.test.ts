
import { describe } from '@jest/globals'

import Validator from './validator'
import validatorMerge from './validator-merge'
import { testValidator } from './util.test'

//// Setup ////

const $string = new Validator({
    name: 'string',
    isValid: (i: unknown): i is string => typeof i === 'string'
})

const $lower = new Validator({
    name: 'lowercase',
    transform: (i: string) => i.toLowerCase(),
})

const $trim = new Validator({
    name: 'trimmed',
    transform: (i: string) => i.trim(),
})

//// Tests ////

describe('merge 2 validators', () => {

    const $lowerString = validatorMerge($string, $lower)
    testValidator($lowerString, { input: 'Ace', output: 'ace', transform: true })

    testValidator($lowerString, { input: 'ace', output: 'ace', transform: false })

    testValidator($lowerString, { input: 0, error: 'Must be string', transform: true })
    testValidator($lowerString, { input: 'Ace', error: 'Must be lowercase', transform: false })

})

describe('merge 3 validators', () => {

    const $lowerTrimString = validatorMerge($string, $trim, $lower)
    testValidator($lowerTrimString, { input: 0, error: 'Must be string', transform: false })
    testValidator($lowerTrimString, { input: 'Face', error: 'Must be lowercase', transform: false })
    testValidator($lowerTrimString, { input: ' face ', error: 'Must be trimmed', transform: false })

    testValidator($lowerTrimString, { input: 'face', output: 'face', transform: false })
    testValidator($lowerTrimString, { input: ' face ', output: 'face', transform: true })
    testValidator($lowerTrimString, { input: ' FACE ', output: 'face', transform: true })
    testValidator($lowerTrimString, { input: 'FACE', output: 'face', transform: true })
})

describe('merge 3 settings', () => {

    const $positiveInteger = validatorMerge(
        {
            name: 'number',
            isValid: (i: unknown): i is number => typeof i === 'number'
        }, {
            name: 'integer',
            transform: (i: number)=> Math.floor(i)
        }, {
            name: 'positive',
            isValid: (i: number) => i > 0
        }
    )

    testValidator($positiveInteger, { input: '0', error: 'Must be number', transform: false })
    testValidator($positiveInteger, { input: 0, error: 'Must be positive', transform: false })
    testValidator($positiveInteger, { input: 1.5, error: 'Must be integer', transform: false })
    testValidator($positiveInteger, { input: 1.5, output: 1, transform: true })

})