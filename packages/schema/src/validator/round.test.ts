import { $$copy } from '@benzed/immutable'
import RoundValidator from './round'

const toTen = new RoundValidator({ method: 'round', precision: 10 })
const toEven = new RoundValidator({ method: 'round', precision: 2, error: 'must be even' })

it('rounds input to precision if transform is enabled', () => {
    expect(toTen.validate(3, true)).toEqual(0)
    expect(toTen.validate(5, true)).toEqual(10)
})

it('throws if input is not rounded if transform is disabled', () => {
    expect(() => toTen.validate(3, false)).toThrow('must be rounded to 10')
})

it('uses error setting', () => {
    expect(() => toEven.validate(3, false)).toThrow('must be even')
})

it('can be configured with floor method', () => {
    const toTenFloor = toTen[$$copy]()
    toTenFloor.applySettings({ method: 'floor' })

    expect(toTenFloor.validate(7, true)).toEqual(0)
})

it('can be configured with ceil method', () => {
    const toTenCeil = toTen[$$copy]()
    toTenCeil.applySettings({ method: 'ceil' })

    expect(toTenCeil.validate(2, true)).toEqual(10)
})