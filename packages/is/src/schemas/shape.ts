
import { 

    SchemaBuilder,

    PipeValidatorBuilder,
    EnsureModifier,
    ensureModifier,

    ModifierType,

    ValidatorState,
    Validator,

    ShapeValidator,
    ShapeValidatorInput,
    ShapeValidatorOutput,
    SchemaMainStateApply,
    ContractSchema,

} from '@benzed/schema'

import {
    each,
    Infer,
    omit,
    pick
} from '@benzed/util'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _EnsurePropertyModifier<
    T extends ShapeValidatorInput,
    M extends ModifierType
> = Infer<{
        [K in keyof T]: EnsureModifier<T[K], M>
    }, ShapeValidatorInput>

//// Types ////

type PropertyMethod<T extends ShapeValidatorInput, K extends keyof T> = 
    (prop: T[K]) => Validator
    
type Property<
    T extends ShapeValidatorInput, 
    K extends keyof T, 
    U extends PropertyMethod<T,K>
> = Infer<{
        [Tk in keyof T]: Tk extends K 
            ? ReturnType<U> 
            : T[Tk]
    }, ShapeValidatorInput>

type Pick<
    T extends ShapeValidatorInput,
    K extends (keyof T)[]
> = Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, ShapeValidatorInput>

type Omit<
    T extends ShapeValidatorInput,
    K extends (keyof T)[]
> = Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, ShapeValidatorInput>

type Merge<
    A extends ShapeValidatorInput,
    B extends ShapeValidatorInput,
> = Infer<{
        [K in keyof A | keyof B]: K extends keyof B 
            ? B[K]
            : K extends keyof A 
                ? A[K]
                : never
    }, ShapeValidatorInput>

type Partial<T extends ShapeValidatorInput> = 
    _EnsurePropertyModifier<T, ModifierType.Optional>

//// Implementation ////

class Shape<T extends ShapeValidatorInput> extends ContractSchema<ShapeValidator<T>, {}> {

    constructor(properties: T) {
        super(
            new ShapeValidator(properties),
            {}
        )
    }

    get properties(): T {
        return this[SchemaBuilder.main].properties
    }

    //// Builder Methods ////

    /**
     * A shape where strictness is disabled:
     * ```
     * const todo = is.shape({
     *     description: is.string,
     *     completed: is.boolean
     * }).strict(false)
     * 
     * ```
     * 
     * Will allow keys not defined by the shape's properties
     * to pass validation.
     * 
     * Shapes are strict by default.
     */
    strict(strict = true) {
        return this._applyMainValidator({ strict })
    }

    default(def: ShapeValidator<T>['default']) {
        return this._applyMainValidator({ 
            default: def 
        } as SchemaMainStateApply<ShapeValidator<T>>)
    }

    /**
     * Update the property at the given key
     */
    property<K extends keyof T, U extends PropertyMethod<T,K>>(
        key: K,
        update: U
    ): Shape<Property<T, K, U>> {

        const newProp = update(this.properties[key])
        const newProps = { 
            ...this.properties, 
            [key]: newProp 
        }

        return this._applyShape(newProps) as unknown as Shape<Property<T, K, U>>
    }

    /**
     * Reduce the shape to the given keys
     */
    pick<K extends (keyof T)[]>(
        ...keys: K
    ): Shape<Pick<T, K>> {
        const newProps = pick(this.properties, ...keys)
        return this._applyShape(newProps) as unknown as Shape<Pick<T, K>>
    }

    /**
     * Remove the given keys from the shape
     */
    omit<K extends (keyof T)[]>(
        ...keys: K
    ): Shape<Omit<T, K>> {
        const omittedProps = omit(this.properties, ...keys)
        return this._applyShape(omittedProps) as unknown as Shape<Omit<T,K>>
    }

    /**
     * Merge shape with additional properties
     */
    merge<Tx extends ShapeValidatorInput>(
        shapeOrProperties: Tx | Shape<Tx>
    ): Shape<Merge<T, Tx>> {

        const properties = shapeOrProperties instanceof Shape 
            ? shapeOrProperties.properties
            : shapeOrProperties as ShapeValidatorInput

        return this._applyShape({
            ...this.properties,
            ...properties
        }) as unknown as Shape<Merge<T,Tx>>
    }

    /**
     * Make all properties optional.
     */
    get partial(): Shape<Partial<T>> {

        const propertiesPartial = { ...this.properties } as ShapeValidatorInput
        for (const key of each.keyOf(propertiesPartial)) {
            propertiesPartial[key] = ensureModifier(
                propertiesPartial[key],
                ModifierType.Optional
            )
        }
        return this._applyShape(propertiesPartial) as unknown as Shape<Partial<T>>
    }

    //// Helper ////

    protected _applyShape(
        properties?: ShapeValidatorInput
    ): this {
        return Validator.applyState(
            this,
            {
                [SchemaBuilder.main]: { properties },
                [SchemaBuilder.builder]: PipeValidatorBuilder.empty()
            } as ValidatorState<this>
        )
    }
}

//// Exports ////

export default Shape 

export {

    Shape,

    Pick as ShapePick,
    Omit as ShapeOmit,
    Merge as ShapeMerge,
    Partial as ShapePartial,

    Property as ShapeProperty,
    PropertyMethod as ShapePropertyMethod,

    ShapeValidatorInput as ShapeInput,
    ShapeValidatorOutput as ShapeOutput
}