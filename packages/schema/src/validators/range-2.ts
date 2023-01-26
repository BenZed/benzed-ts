// import { isSortable, Sortable, by } from '@benzed/util'
// import { ValidationErrorInput } from '../validator/validate-error'
// import Validator from '../validator/validator'

// //// Settings ////

// interface RangeSettings<T extends Sortable> {
//     readonly inclusive: boolean
//     readonly min: T
//     readonly max: T
// }

// interface RangeValidatorSettings<T extends Sortable> extends Required<RangeSettings<T>> {
//     readonly error?: ValidationErrorInput<T>
//     readonly name: string
// }

// //// TODO Add when .apply interface for Validators work  ////

// // type UnaryComparator = '>=' | '>' | '<' | '<='
// // type BinaryComparator = '..' | '...'

// // type RangeValidatorParams<T extends Sortable> = 
// //     | [comparator: UnaryComparator, value: T]
// //     | [min: T, max: T]
// //     | [min: T, comparator: BinaryComparator, max: T]

// //// Implementation ////

// class RangeValidator<T extends Sortable> extends Validator<T,T> implements RangeValidatorSettings<T> {

//     readonly inclusive: boolean
//     readonly min: T
//     get hasMin(): boolean {
//         return isFinite(this.min)
//     }

//     readonly max: T
//     get hasMax(): boolean {
//         return isFinite(this.max)
//     }

//     constructor({ error, name = 'range', max, min, inclusive = false }: Partial<RangeValidatorSettings<T>>) {
//         super({ name, error })
//         this.max = max ?? Infinity as T
//         this.min = min ?? -Infinity as T
//         this.inclusive = inclusive
//     }

//     override error(): string {
//         const { min, hasMin, max, hasMax, inclusive } = this

//         const detail = hasMin && hasMax 
//             ? `between ${min} and ${inclusive ? 'equal to ' : ''}${max}`
//             : this.hasMin 
//                 ? `equal or above ${min}`
//                 : `${inclusive ? 'equal to or ' : ''}below ${max}`
//         return `Must be ${detail}`
//     }

//     override isValid(input: T): boolean {
//         const { min, hasMin, max, hasMax, inclusive } = this

//         if (hasMin && hasMax)
//             return 

//         return input >= this.min && (
//             inclusive 
//                 ? input <= max
//                 : input < max
//         )
//     }
// }

// //// Exports ////

// export default RangeValidator

// export {
//     RangeValidator,
//     RangeValidatorSettings
// }