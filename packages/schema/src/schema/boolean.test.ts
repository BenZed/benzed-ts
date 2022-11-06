import BooleanSchema from './boolean'

const $bool = new BooleanSchema()

describe(`validate()`, () => {

    it(`validates boolean values`, () => {
        expect($bool.validate(true))
            .toEqual(true)

        expect($bool.validate(false))
            .toEqual(false)

        expect(() => $bool.validate(`what`))
            .toThrow(`must be a boolean`)
    })

    it(`casts "true" to true`, () => {
        expect($bool.validate(`true`))
            .toEqual(true)
    })

    it(`casts "false" to false`, () => {
        expect($bool.validate(`false`))
            .toEqual(false)
    })

})

describe(`default()`, () => {

    it(`default()s to false`, () => {
        expect($bool.default().validate(undefined)).toBe(false)
    })

    it(`respects default setting, if valid`, () => {
        expect($bool.default(true).validate(undefined)).toEqual(true)
    })

})