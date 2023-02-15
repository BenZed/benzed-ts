
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
    ValidateUpdateSettings,
} from '@benzed/schema'

import { 
    Infer, 
    keysOf, 
    omit, 
    pick 
} from '@benzed/util'

import { 
    ShapeInput, 
    ShapeOutput, 
    ShapeValidator, 
    TypeDefault 
} from '../validators'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _ShapePropertyMethod<T extends ShapeInput, K extends keyof T> = 
    (prop: T[K]) => AnyValidateStruct

type _ShapeProperty<
    T extends ShapeInput, 
    K extends keyof T, 
    U extends _ShapePropertyMethod<T,K>
> = Shape<
        Infer<{
            [Tk in keyof T]: Tk extends K 
                ? ReturnType<U> 
                : T[K]
        }, ShapeInput>
    >

type _ShapePick<
    T extends ShapeInput,
    K extends (keyof T)[]
> = Shape<
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, ShapeInput>
>

type _ShapeOmit<
    T extends ShapeInput,
    K extends (keyof T)[]
> = Shape<
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, ShapeInput>
>

type _ShapeMerge<
    A extends ShapeInput,
    B extends ShapeInput,
> = Shape<
        Infer<{
            [K in keyof A | keyof B]: K extends keyof B 
                ? B[K]
                : K extends keyof A 
                    ? A[K]
                    : never
        }, ShapeInput>
    >

type _ShapeEnsurePropertyMutator<
    T extends ShapeInput,
    M extends MutatorType
> = Shape<
    Infer<{
        [K in keyof T]: EnsureMutator<T[K], M>
    }, ShapeInput>
    >

type _ShapePartial<T extends ShapeInput> = _ShapeEnsurePropertyMutator<T, MutatorType.Optional>

//// Implemetnation ////

class Shape<T extends ShapeInput> extends SchemaBuilder<ShapeValidator<T>, {}> {

    constructor(properties: T) {
        super(
            new ShapeValidator(properties), 
            {}
        )
    }

    get properties(): T {
        return this[$$settings][$$main].properties
    }

    //// Builder Methods ////

    /**
     * Set a default object 
     */
    default(def: (ctx: ValidationContext<unknown>) => unknown): this {
        return this._applyMainValidator({ 
            default: def 
        })
    }

    /**
     * Update the property at the given key
     */
    property<K extends keyof T, U extends _ShapePropertyMethod<T,K>>(
        key: K,
        update: U
    ): _ShapeProperty<T, K, U> {

        const newProp = update(this.properties[key])
        const newProps = { 
            ...this.properties, 
            [key]: newProp 
        }

        return this._applyMainValidator({ 
            properties: newProps 
        }) as unknown as _ShapeProperty<T, K, U>
    }

    /**
     * Reduce the shape to the given keys
     */
    pick<K extends (keyof T)[]>(
        ...keys: K
    ): _ShapePick<T, K> {
        const newProps = pick(this.properties, ...keys)
        return this._applyMainValidator({ 
            properties: newProps 
        }) as unknown as _ShapePick<T, K>
    }

    /**
     * Remove the given keys from the shape
     */
    omit<K extends (keyof T)[]>(
        ...keys: K
    ): _ShapeOmit<T, K> {
        const omittedProps = omit(this.properties, ...keys)
        return this._applyMainValidator({ 
            properties: omittedProps 
        }) as unknown as _ShapeOmit<T,K>
    }

    /**
     * Merge shape with additional properties
     */
    merge<Tx extends ShapeInput>(
        shapeOrProperties: Tx | Shape<Tx>
    ): _ShapeMerge<T, Tx> {

        const properties = shapeOrProperties instanceof Shape 
            ? shapeOrProperties.properties
            : shapeOrProperties as ShapeInput

        return this._applyMainValidator({
            properties: {
                ...this.properties,
                ...properties
            }
        }) as unknown as _ShapeMerge<T,Tx>
    }

    /**
     * Make all properties optional.
     */
    partial(): _ShapePartial<T>{

        const propertiesPartial = { ...this.properties } as ShapeInput
        for (const key of keysOf(propertiesPartial)) {
            propertiesPartial[key] = ensureMutator(
                propertiesPartial[key], 
                MutatorType.Optional
            )
        }

        return this._applyMainValidator({ 
            properties: propertiesPartial 
        }) as unknown as _ShapePartial<T>
    }

    //// Helper ////

    protected override _applyMainValidator(
        main: { properties?: ShapeInput, default?: TypeDefault }
    ): this {
    
        const builder = 'properties' in main 
            ? PipeValidatorBuilder.empty()
            : this[$$builder]
    
        return ValidateStruct.applySettings(
            this,
            {
                [$$main]: { ...this[$$main], ...main },
                [$$builder]: builder
            } as ValidateUpdateSettings<this>
        )
    }

}

//// Exports ////

export default Shape 

export {
    Shape,
    ShapeInput,
    ShapeOutput
}