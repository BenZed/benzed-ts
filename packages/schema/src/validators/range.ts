import { isFinite } from '@benzed/util'
import { Validator } from '../validator'

//// Interview ////

const _range = new Validator({

    name: 'range',

    error() {
        const hasMax = isFinite(this.max)
        const hasMin = isFinite(this.min)
        const inc = this.inclusive 

        const detail = hasMin && hasMax 
            ? `between ${this.min} and ${inc ? 'equal to ' : ''}${this.max}`
            : hasMin 
                ? `equal or above ${this.min}`
                : `${inc ? 'equal to or ' : ''}below ${this.max}`

        return `Must be ${detail}` 
    },

    isValid(input: number) {
        return input >= this.min && (
            this.inclusive 
                ? input <= this.max
                : input < this.max
        )
    },

    inclusive: false,
    min: -Infinity,
    max: Infinity

})

type _RangeValidator = typeof _range

//// Exports ////

export interface RangeValidator extends _RangeValidator {}

export const $range: RangeValidator = _range
