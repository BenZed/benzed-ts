import { DefaultValidator } from './default'
import { TransformValidator } from './validator'

const defaultValidator = new DefaultValidator({
    default: `default`
})

it(`is a transform validator`, () => {
    expect(defaultValidator).toBeInstanceOf(TransformValidator)
})

it(`transforms a default value on undefined input`, () => {
    expect(defaultValidator.validate(undefined, true))
        .toEqual(`default`)
})

it(`other values are unmutated`, () => {
    expect(defaultValidator.validate(null, true))
        .toEqual(null)
})

describe(`settings`, () => {

    it(`can take a default method`, () => {
        const dNum = new DefaultValidator({ default: 100 })

        expect(dNum.validate(undefined, true))
            .toEqual(100)
    })

    it(`can take an empty object`, () => {
        const dEmpty = new DefaultValidator({})

        expect(dEmpty.validate(undefined, true))
            .toEqual(undefined)
    })

})