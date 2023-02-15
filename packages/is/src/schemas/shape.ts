
import { 

    $$settings,
    $$main,

    SchemaBuilder,
    $$builder,

    AnyValidateStruct,
    ValidateStruct,

    PipeValidatorBuilder,
    EnsureMutator,
    ensureMutator,

    MutatorType,

    ValidationContext,
} from '@benzed/schema'

import { Infer, keysOf, omit, pick } from '@benzed/util'
import { ShapeInput, ShapeOutput, ShapeValidator, TypeDefault } from '../validators'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _ShapePropertyMethod<T extends ShapeInput, K extends keyof T> = 
    (prop: T[K]) => AnyValidateStruct

type _ShapeProperty<
    T extends ShapeInput, 
    K extends keyof T, 
    U extends _ShapePropertyMethod<T,K>
> = Infer<{
    [Tk in keyof T]: Tk extends K 
        ? ReturnType<U> 
        : T[K]
}, ShapeInput>

type _ShapePick<
    T extends ShapeInput,
    K extends (keyof T)[]
> = Infer<{
    [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
}, ShapeInput>

type _ShapeOmit<
    T extends ShapeInput,
    K extends (keyof T)[]
> = Infer<{
    [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
}, ShapeInput>

type _ShapeMerge<
    A extends ShapeInput,
    B extends ShapeInput,
> = Infer<{
    [K in keyof A | keyof B]: K extends keyof B 
        ? B[K]
        : K extends keyof A 
            ? A[K]
            : never
}, ShapeInput>

type _ShapeEnsurePropertyMutator<
    T extends ShapeInput,
    M extends MutatorType
> = Infer<{
    [K in keyof T]: EnsureMutator<T[K], M>
}, ShapeInput>

//// Types ////

interface Shape<T extends ShapeInput> 
    extends SchemaBuilder<ShapeValidator<T>, {}> {

    get properties(): T

    /**
     * Set a default object 
     */
    default(def: (ctx: ValidationContext<unknown>) => unknown): this 

    /**
     * Update the property at the given key
     */
    property<
        K extends keyof T,
        U extends _ShapePropertyMethod<T,K>
    >(
        key: K,
        update: U
    ): Shape<_ShapeProperty<T, K, U>> // update a property

    /**
     * Make all properties optional.
     */
    partial(): Shape<_ShapeEnsurePropertyMutator<T, MutatorType.Optional>>

    /**
     * Reduce the shape to the given keys
     */
    pick<K extends (keyof T)[]>(
        ...keys: K
    ): Shape<_ShapePick<T, K>>

    /**
     * Remove the given keys from the shape
     */
    omit<K extends (keyof T)[]>(
        ...keys: K
    ): Shape<_ShapeOmit<T, K>>

    /**
     * Merge shape with additional properties
     */
    merge<Tx extends ShapeInput>(
        properties: Tx | Shape<Tx>
    ): Shape<_ShapeMerge<T, Tx>>

}

//// Helper ////

function applyShape<T>(
    shape: T, 
    main: { properties?: ShapeInput, default?: TypeDefault }
): T {

    const schema = shape as any

    const builder = 'properties' in main 
        ? PipeValidatorBuilder.empty()
        : schema[$$builder]

    return ValidateStruct.applySettings(
        schema,
        {
            [$$main]: { ...schema[$$main], ...main },
            [$$builder]: builder
        }
    )
}

//// Implemetnation ////

const Shape = class Shape extends SchemaBuilder<ShapeValidator<ShapeInput>, {}> {

    get properties(): ShapeInput {
        return this[$$settings][$$main].properties
    }

    default(def: TypeDefault): this {
        return applyShape(this, { default: def })
    }

    property(
        key: keyof ShapeInput,
        update: _ShapePropertyMethod<ShapeInput, keyof ShapeInput>
    ): this {

        const newProp = update(this.properties[key])
        const newProps = { 
            ...this.properties, 
            [key]: newProp 
        }

        return applyShape(this, { properties: newProps })
    }

    pick(...keys: (keyof ShapeInput)[]): this {
        const newProps = pick(this.properties, ...keys)
        return applyShape(this, { properties: newProps })
    }

    omit(...keys: (keyof ShapeInput)[]): this {
        const newProps = omit(this.properties, ...keys)
        return applyShape(this, { properties: newProps })
    }

    merge(shapeOrProperties: object): this {

        const properties = shapeOrProperties instanceof Shape 
            ? shapeOrProperties.properties
            : shapeOrProperties as ShapeInput

        return applyShape(
            this, 
            {
                properties: {
                    ...this.properties,
                    ...properties
                }
            }
        )
    }

    partial(): this {
        const partialProps = { ...this.properties }
        for (const key of keysOf(partialProps)) {
            partialProps[key] = ensureMutator(
                partialProps[key], 
                MutatorType.Optional
            )
        }
        return applyShape(
            this,
            { properties: partialProps }
        )
    }

    constructor(properties: ShapeInput) {
        super(
            new ShapeValidator(properties), 
            {}
        )
    }

} as new <T extends ShapeInput>(properties: T) => Shape<T>

//// Exports ////

export default Shape 

export {
    Shape,
    ShapeInput,
    ShapeOutput
}