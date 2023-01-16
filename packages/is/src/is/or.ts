import { Func, Primitive, TypeGuard, TypesOf } from '@benzed/util'
import { CallableStruct } from '@benzed/immutable'
import { Last } from '@benzed/array'

import { _Factory } from './is'
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

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
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

//// Or Factory ////

class OrTo<S extends AnySchematic[]> extends CallableStruct<ToIsOr<S>> implements _Factory {

    static to<T extends ResolveSchematicsInput>(...inputs: T): IsOr<T> {

        const outputs: AnySchematic[] = []

        const isValueSchematic = Value[Symbol.hasInstance].bind(Value) as TypeGuard<Value<Primitive>>

        const isUnique = (t1: AnySchematic): boolean => 
            !isValueSchematic(t1) ||
            !outputs.filter(isValueSchematic).some(t1.equals)

        for (const input of inputs) {

            const type = Schematic.to(input) as AnySchematic

            const flattened = type instanceof Or 
                ? type.types as AnySchematic[] 
                : [type]

            const unique = flattened.filter(isUnique)

            outputs.push(...unique)
        }

        const output = outputs.length === 1 
            ? outputs[0] 
            : new Or(...outputs)
        return output as IsOr<T>
    }

    readonly from: S
    constructor(...from: S) {
        super((...args: ResolveSchematicsInput) => OrTo.to(...this.from, ...args))
        this.from = from
    }

    //// Chain ////
    
    get boolean(): ResolveSchematics<[...S, Boolean]> {
        return OrTo.to(...this.from, isBoolean)
    }

    get string(): IsOr<[...S, String]> {
        return OrTo.to(...this.from, isString)
    }

    get number(): IsOr<[...S, Number]> {
        return OrTo.to(...this.from, isNumber)
    }

    get array(): IsOr<[...S, Array]> {
        return OrTo.to(...this.from, isArray)
    }

    instanceOf<T extends InstanceInput>(
        type: T
    ): IsOr<[...S, Instance<T>]> {
        return OrTo.to(...this.from, new Instance(type))
    }

}

//// Or ////

type Or<T extends readonly AnySchematic[]> = Schematic<TypesOf<T>[number]> & {
    [K in keyof Last<T>]: _InheritOr<Last<T>[K], T>
} & {
    readonly types: T
}

const Or = class extends Schematic<unknown> {

    readonly types: readonly AnySchematic[]

    constructor(...types: readonly AnySchematic[]) {

        super(function (this: Or<readonly AnySchematic[]>, i, options?) {
            const errors: unknown[] = []

            const types = this.types
            for (const type of types) {
                if (type.is(i))
                    return i
            }

            for (const type of types) {
                try {
                    return type.validate(i, options)
                } catch (e) {
                    errors.push(e)
                }
            }

            throw new AggregateError(errors)
        })
        
        this.types = types
        this._applyInterfaceOfLastType()
    }

    private _applyInterfaceOfLastType(): void {
        // TODO
    }

} as unknown as (new <T extends AnySchematic[]>(...types: T) => Or<T>)

//// Exports ////

export default OrTo

export {
    OrTo,
    Or
}