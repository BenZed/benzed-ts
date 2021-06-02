
/* eslint-disable
    @typescript-eslint/no-namespace,
    @typescript-eslint/no-unused-vars,
    @typescript-eslint/prefer-readonly-parameter-types,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Validator Types ***/

/***  Validator Prop Arguments ***/

// interface ArrayLikeValidatorProps<T extends { length: number }>
//     extends MutableValidatorProps<T> {
//     length?: RangePropArguments
// }

// interface NumericValidatorProps extends ImmutableValidatorProps<number> {
//     range: RangePropArguments
// }

// interface ObjectValidatorProps<K extends string | number | symbol, V = any>
//     extends MutableValidatorProps<Record<K, V>> {
//     strict?: boolean
//     plain?: boolean
// }

// interface StrictObjectValidatorProps<K extends string | number | symbol, V>
//     extends ObjectValidatorProps<K, V> {
//     strict?: true
//     children?: Children
// }

// interface LooseObjectValidatorProps<K extends string | number | symbol, V>
//     extends ObjectValidatorProps<K, V> {
//     strict?: false
//     children?: NoChildren
// }

// export interface DefaultValidators {
// boolean: ImmutableValidatorProps<boolean>
// number: NumericValidatorProps
// array: ArrayLikeValidatorProps<any>
// object: StrictObjectValidatorProps<any, any> | LooseObjectValidatorProps<any, any>
// enum: ImmutableValidatorProps<number>
// multi: GenericValidatorProps
// symbol: ImmutableValidatorProps<symbol>
// function: GenericValidatorProps
// set: MutableValidatorProps<Set<any>>
// map: MutableValidatorProps<Map<any, any>>
// date: MutableValidatorProps<Date>
// any: MutableValidatorProps<any>
// }

