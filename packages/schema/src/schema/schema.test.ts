import { Schema } from './schema'

import { testValidator } from '../util.test'

//// Tests ////

describe('created from generic validate method', () => {

    const $average = new Schema((i: number[]) => {
        if (i.length < 3)
            throw new Error('Must take the average of at least three numbers')

        return i.reduce((v, i) => i + v, 0) / i.length
    })

    testValidator($average, { input: [1, 2, 3], output: 2, transform: false })
    testValidator($average, { input: [1], error: 'ust take the average', transform: false })

    const $averageAbove5 = $average.asserts(i => i > 5, 'ust be higher than 5')
    testValidator($averageAbove5, { input: [ 1, 2, 3 ], error: 'ust be higher than 5', transform: false })
    testValidator($averageAbove5, { input: [ 4, 6, 8, 10 ], output: 7, transform: false })
})

it('created from generic transform', () => {
    const $parse = new Schema((i: string) => parseInt(i))   
        .asserts(i => !Number.isNaN(i), v => `Could not convert "${v}" into a number.`)
 
    expect($parse('1')).toEqual(1)
    expect(() => $parse('ace')).toThrow('Could not convert "ace" into a number.')
})
