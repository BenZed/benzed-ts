import { assertDefined } from './assert-defined'

describe(`assertDefinedOutput`, () => {
    const getNull = (): null => null

    it(`Output method throws if return value is nullable`, () => {
        const getNullAssert = assertDefined(getNull)
        expect(() => getNullAssert()).toThrow(`Value null or undefined`)
    })

    it(`Output method doesnt throw if return value is not nullable`, () => {
        const sup = assertDefined(() => `sup`)
        expect(() => sup()).not.toThrow()
    })

    it(`Takes an optional error message`, () => {

        const err = `See, you fucked up`
        const getNullAssertCustomErr = assertDefined(getNull, err)
        expect(() => getNullAssertCustomErr()).toThrow(err)
    })

})