import { isNumber } from './is-basic'

//// Main ////

export function isMultipleOf(input: unknown, multiple: number): input is number {
    return isNumber(input) && input % multiple === 0
}

export function isEven(input: unknown): input is number {
    return isMultipleOf(input, 2)
}

export function isOdd(input: unknown): input is number {
    return !isEven(input)
}

export function isPositive(input: unknown): input is number {
    return isNumber(input) && input > 0
}

export function isNegative(input: unknown): input is number {
    return isNumber(input) && input < 0
}

export function isInteger(input: unknown): input is number {
    return Number.isInteger(input)
}

function _isFinite(input: unknown): input is number {
    return isNumber(input) && isFinite(input)
}

export {
    _isFinite as isFinite
}