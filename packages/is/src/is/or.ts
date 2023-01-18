import { Func, merge, Property, TypesOf } from '@benzed/util'
import { Last } from '@benzed/array'

import { AnySchematic } from '../schema'

import { Ref } from './ref'
import { Validate, ValidateOptions } from '../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

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

type Or<T extends readonly AnySchematic[]> = 
    Ref<TypesOf<T>[number]> & 
    {
        [K in keyof Last<T>]: _InheritOr<Last<T>[K], T>
    } & {
        readonly types: T
    }

//// Helper ////

function validateUnion(
    this: Or<readonly AnySchematic[]>, 
    i: unknown, 
    options?: ValidateOptions
): unknown {

    const types = this.types
    for (const type of types) {
        if (type.is(i))
            return i
    }

    const errors: unknown[] = []
    for (const type of types) {
        try {
            return type.validate(i, options)
        } catch (e) {
            errors.push(e)
        }
    }

    throw new AggregateError(errors)
}

//// Or ////

const Or = class extends Ref<unknown> {

    readonly types!: readonly AnySchematic[]
    constructor(...types: readonly AnySchematic[]) {
        const ref = types.at(-1)
        if (!ref)
            throw new Error('Must have at least one type.')

        super(ref)
        this._assignTypes(types)
    }

    //// Helper ////

    private _assignTypes(
        types: readonly AnySchematic[], 
        newLast?: AnySchematic
    ): void {

        if (types.some(type => type instanceof Or)) {
            throw new Error(
                `${Or.name} cannot contain other ${Or.name} ` + 
                'instances. Flatten them.'
            )
        }

        if (types.length < 2) {
            throw new Error(
                `${Or.name} requires at least two types to create a union.`
            )
        }

        merge(
            this,
            {
                types: newLast ? [ ...types.slice(0, -1), newLast ] : types
            }
        )
    }
    
    protected override _setValidate(): Validate<unknown> {
        return Property.name(
            validateUnion.bind(this as unknown as Or<readonly AnySchematic[]>),
            'validateUnion'
        )
    }

    //// Overrides ////

    protected override _copyWithRef(schematic: AnySchematic): this {
        const clone = super._copyWithRef(schematic)
        clone._assignTypes(this.types, schematic)
        return clone as this        
    }

} as unknown as (new <T extends AnySchematic[]>(...types: T) => Or<T>)

//// Exports ////

export default Or

export {
    Or
}