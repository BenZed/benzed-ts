
import { 
    ShapeValidatorInput as ShapeInput,
    ShapeValidatorOutput as ShapeOutput,
    ShapeValidator,
    SchemaBuilder,
    $$settings,
    $$main,
    AnyValidateStruct,
    ValidateStruct,
    $$builder,
    PipeValidatorBuilder,
    Validators,
    EnsureMutator,
    MutatorType,
    ensureMutator,
} from '@benzed/schema'

import { Infer, keysOf, omit, pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
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

function applyProperties<T>(
    shape: T, 
    properties: ShapeInput
): T {
    return ValidateStruct.applySettings(
        shape as any,
        {
            [$$main]: new ShapeValidator(properties),
            [$$builder]: new PipeValidatorBuilder(
                // TODO PipeValidatorBuilder.empty?
                ...[] as unknown as Validators<any,any>
            )
        }
    )
}

//// Implemetnation ////

const Shape = class Shape extends SchemaBuilder<ShapeValidator<ShapeInput>, {}> {

    get properties(): ShapeInput {
        return this[$$settings][$$main].properties
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

        return applyProperties(this, newProps)
    }

    pick(...keys: (keyof ShapeInput)[]): this {
        const newProps = pick(this.properties, ...keys)
        return applyProperties(this, newProps)
    }

    omit(...keys: (keyof ShapeInput)[]): this {
        const newProps = omit(this.properties, ...keys)
        return applyProperties(this, newProps)
    }

    merge(shapeOrProperties: object): this {

        const properties = shapeOrProperties instanceof Shape 
            ? shapeOrProperties.properties
            : shapeOrProperties as ShapeInput

        return applyProperties(
            this, 
            {
                ...this.properties,
                ...properties
            }
        )
    }

    partial(): this {
        const partialProps = { ...this.properties }
        for (const key of keysOf(partialProps)) 
            partialProps[key] = ensureMutator(partialProps[key], MutatorType.Optional)
    
        return applyProperties(
            this,
            partialProps
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