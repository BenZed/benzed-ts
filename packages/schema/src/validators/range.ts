import { isSortable, Sortable, by } from '@benzed/util'
import { ValidationErrorInput } from '../validator/validate-error'
import Validator from '../validator/validator'

//// TODO: Implement ////

//// Settings ////

interface RangeSettings<T extends Sortable> {
    readonly inclusive: boolean
    readonly min: T
    readonly max: T
}

interface RangeValidatorSettings<T extends Sortable> extends Required<RangeSettings<T>> {
    readonly error?: ValidationErrorInput<T>
    readonly name: string
}

type UnaryComparator = '>=' | '>' | '<' | '<='
type BinaryComparator = '..' | '...'

type RangeValidatorParams<T extends Sortable> = 
    | [comparator: UnaryComparator, value: T]
    | [min: T, max: T]
    | [min: T, comparator: BinaryComparator, max: T]

//// Implementation ////

class RangeValidator<T extends Sortable> extends Validator<T,T> implements RangeValidatorSettings<T> {}

//// Exports ////

export default RangeValidator

export {
    RangeValidator,
    RangeValidatorSettings
}