
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
    ValidationErrorMessage,

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

type _ShapePropertyMethod<T extends ShapeValidatorInput, K extends keyof T> = 
    (prop: T[K]) => Validator

type _ShapeProperty<
    T extends ShapeValidatorInput, 
    K extends keyof T, 
    U extends _ShapePropertyMethod<T,K>
> = Shape<
        Infer<{
            [Tk in keyof T]: Tk extends K 
                ? ReturnType<U> 
                : T[K]
        }, ShapeValidatorInput>
    >

type _ShapePick<
    T extends ShapeValidatorInput,
    K extends (keyof T)[]
> = Shape<
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, ShapeValidatorInput>
>

type _ShapeOmit<
    T extends ShapeValidatorInput,
    K extends (keyof T)[]
> = Shape<
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, ShapeValidatorInput>
>

type _ShapeMerge<
    A extends ShapeValidatorInput,
    B extends ShapeValidatorInput,
> = Shape<
        Infer<{
            [K in keyof A | keyof B]: K extends keyof B 
                ? B[K]
                : K extends keyof A 
                    ? A[K]
                    : never
        }, ShapeValidatorInput>
    >

type _ShapeEnsurePropertyModifier<
    T extends ShapeValidatorInput,
    M extends ModifierType
> = Shape<
    Infer<{
        [K in keyof T]: EnsureModifier<T[K], M>
    }, ShapeValidatorInput>
    >

type _ShapePartial<T extends ShapeValidatorInput> = _ShapeEnsurePropertyModifier<T, ModifierType.Optional>

//// Implementation ////

class Shape<T extends ShapeValidatorInput> extends SchemaBuilder<ShapeValidator<T>, {}> {

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

    named(name: string) {
        return this._applyMainValidator({ name })
    }

    default(def: ShapeValidator<T>['default']) {
        return this._applyMainValidator({ 
            default: def 
        } as SchemaMainStateApply<ShapeValidator<T>>)
    }

    message(message: ValidationErrorMessage<unknown, ShapeValidator<T>>) {
        return this._applyMainValidator({
            message
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

        return this._applyShape(newProps) as unknown as _ShapeProperty<T, K, U>
    }

    /**
     * Reduce the shape to the given keys
     */
    pick<K extends (keyof T)[]>(
        ...keys: K
    ): _ShapePick<T, K> {
        const newProps = pick(this.properties, ...keys)
        return this._applyShape(newProps) as unknown as _ShapePick<T, K>
    }

    /**
     * Remove the given keys from the shape
     */
    omit<K extends (keyof T)[]>(
        ...keys: K
    ): _ShapeOmit<T, K> {
        const omittedProps = omit(this.properties, ...keys)
        return this._applyShape(omittedProps) as unknown as _ShapeOmit<T,K>
    }

    /**
     * Merge shape with additional properties
     */
    merge<Tx extends ShapeValidatorInput>(
        shapeOrProperties: Tx | Shape<Tx>
    ): _ShapeMerge<T, Tx> {

        const properties = shapeOrProperties instanceof Shape 
            ? shapeOrProperties.properties
            : shapeOrProperties as ShapeValidatorInput

        return this._applyShape({
            ...this.properties,
            ...properties
        }) as unknown as _ShapeMerge<T,Tx>
    }

    /**
     * Make all properties optional.
     */
    partial(): _ShapePartial<T>{

        const propertiesPartial = { ...this.properties } as ShapeValidatorInput
        for (const key of each.keyOf(propertiesPartial)) {
            propertiesPartial[key] = ensureModifier(
                propertiesPartial[key],
                ModifierType.Optional
            )
        }

        return this._applyShape(propertiesPartial) as unknown as _ShapePartial<T>
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
    ShapeValidatorInput as ShapeInput,
    ShapeValidatorOutput as ShapeOutput
}