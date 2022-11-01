import DateSchema from './date'

const $date = new DateSchema()
const today = new Date()

describe('validate()', () => {

    it('validates date values', () => {
        expect($date.validate(today))
            .toEqual(today)

        // expect(() => $date.validate('what'))
        //     .toThrow('what is not date')

        expect(() => $date.validate(new Date(NaN)))
            .toThrow('must be a date')
    })

    it('casts date strings to Dates', () => {
        const date = new Date(5000).toString()
        expect($date.validate(date))
            .toEqual(new Date(5000))
    })

    it('casts 1000 to Date(1000)', () => {
        expect($date.validate(1000))
            .toEqual(new Date(1000))
    })

})

describe('default()', () => {

    it('respects default setting, if valid', () => {
        expect($date.default(today).validate(undefined)).toEqual(today)
    })

})