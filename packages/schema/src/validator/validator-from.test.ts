
import { describe } from '@jest/globals'
import Validator from './validator'
import { isString } from '@benzed/util'
import { testValidator } from './util.test'

//// Setup ////

const $string = new Validator({
    name: 'string',
    isValid: isString
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

    const $lowerString = Validator.merge($string, $lower)
    testValidator($lowerString, { input: 'Ace', output: 'ace', transform: true })

    testValidator($lowerString, { input: 'ace', output: 'ace', transform: false })

    testValidator($lowerString, { input: 0, error: 'Must be string', transform: true })
    testValidator($lowerString, { input: 'Ace', error: 'Must be lowercase', transform: false })

})

describe('merge 3 validators', () => {

    const $lowerTrimString = Validator.merge($string, $trim, $lower)
    testValidator($lowerTrimString, { input: 0, error: 'Must be string', transform: false })
    testValidator($lowerTrimString, { input: 'Face', error: 'Must be lowercase', transform: false })
    testValidator($lowerTrimString, { input: ' face ', error: 'Must be trimmed', transform: false })

    testValidator($lowerTrimString, { input: 'face', output: 'face', transform: false })
    testValidator($lowerTrimString, { input: ' face ', output: 'face', transform: true })
    testValidator($lowerTrimString, { input: ' FACE ', output: 'face', transform: true })
    testValidator($lowerTrimString, { input: 'FACE', output: 'face', transform: true })
})