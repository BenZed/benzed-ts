import { Func, Primitive, TypeGuard, TypesOf } from '@benzed/util'
import { CallableStruct } from '@benzed/immutable'
import { Last } from '@benzed/array'

import { 
    AnySchematic, 
    
    isArray, 
    Array, 
    
    isBoolean,
    Boolean, 
    
    isString,
    String, 

    isNumber,
    Number, 

    Instance, 
    InstanceInput, 

    Schematic, 

    Value 
} from '../schema'

import { Ref } from './util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Helper TYpes ////

type _ReplaceLast<T extends readonly AnySchematic[], A extends AnySchematic> = T extends [...infer Tf, unknown]
    ? [...Tf, A]
    : [A]

type _InheritOr<S, T extends readonly AnySchematic[]> = S extends AnySchematic 
    ? Or<_ReplaceLast<T,S>>
    : S extends Func
        ? ReturnType<S> extends AnySchematic 
            ? (...params: Parameters<S>) => Or<_ReplaceLast<T, ReturnType<S>>>
            : S
        : S

//// Or ////

type Or<T extends readonly AnySchematic[]> = Schematic<TypesOf<T>[number]> & {
    [K in keyof Last<T>]: _InheritOr<Last<T>[K], T>
} & {
    readonly types: T
}

// const Or = class extends Schematic<unknown> {

//     readonly types: readonly AnySchematic[]

//     constructor(...types: readonly AnySchematic[]) {

//         super(function (this: Or<readonly AnySchematic[]>, i, options?) {
//             const errors: unknown[] = []

//             const types = this.types
//             for (const type of types) {
//                 if (type.is(i))
//                     return i
//             }

//             for (const type of types) {
//                 try {
//                     return type.validate(i, options)
//                 } catch (e) {
//                     errors.push(e)
//                 }
//             }

//             throw new AggregateError(errors)
//         })
        
//         this.types = types
//         this._applyInterfaceOfLastType()
//     }

//     private _applyInterfaceOfLastType(): void {
//         // TODO
//     }

// } as unknown as (new <T extends AnySchematic[]>(...types: T) => Or<T>)

const Or = class extends Ref<AnySchematic> {

    constructor(readonly types: AnySchematic[]) {
        const ref = types.at(-1)
        if (!ref)
            throw new Error('Must have at least one type.')

        super(ref)
    }

    //// Overrides ////

    protected override _wrap(schematic: AnySchematic): this {

        // Replace the last type
        const types = [
            ...this.types.slice(0, -1),
            schematic
        ]

        // Copy
        const This = this.constructor as new (...types: AnySchematic[]) => this
        return new This(...types) 
    }

} as unknown as (new <T extends AnySchematic[]>(...types: T) => Or<T>)

//// Exports ////

export default Or

export {
    Or
}