import RecordSchema from './record'
import StringSchema from './string'
import BooleanSchema from './boolean'

import { expectValidationError } from '../util.test'
import NumberSchema from './number'

/*** Input ***/

const $dict = new RecordSchema([new StringSchema()])

// TODO move me

describe(`validate()`, () => {

    it(`validates records`, () => {
        expect($dict.validate({ word: `definition` }))
            .toEqual({ word: `definition` })

        expect(() => $dict.validate(false))
            .toThrow(`must be an object`)
    })

    it(`validates children`, () => {
        const expectError = expectValidationError(() => $dict.validate({ power: {} }))
        expectError.toHaveProperty(`path`, [`power`])
        expectError.toHaveProperty(`message`, `must be a string`)
    })

    it(`validates nested children`, () => {
        expectValidationError(
            () => $dict.validate({
                america: `country`,
                jamiroquia: {
                    space: true,
                    race: false
                }
            })
        ).toHaveProperty(`path`, [`jamiroquia`])
    })

    it(`optionally validates keys`, () => {
        const $switches = new RecordSchema([
            new NumberSchema(),
            new BooleanSchema()
        ])

        expect($switches.validate({ 0: true, 1: false }))
            .toEqual({ 0: true, 1: false })

        expectValidationError(() => $switches.validate({ 'x': true, 'y': false }))
            .toHaveProperty(`path`, [`x`])
    })

})

describe(`default()`, () => {

    it(`defaults to empty object`, () => {
        expect($dict.default().validate(undefined)).toEqual({})
    })

    it(`respects default setting, if valid`, () => {
        expect(
            $dict
                .default({ word: `play` })
                .validate(undefined)

        ).toEqual({ word: `play` })
    })

})