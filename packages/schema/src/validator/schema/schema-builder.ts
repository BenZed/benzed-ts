
import { Structural } from '@benzed/immutable'
import { assign } from '@benzed/util'
import ValidationContext from '../../validation-context'
import { ValidationErrorMessage } from '../../validation-error'
import { Validator } from '../validator'

import { 
    PipeValidatorBuilder, 
    PipeValidatorBuilderMethods,
    OutputValidator,
    OutputValidatorSettings,
    OutputValidatorPredicate,
    OutputValidatorTransform
} from '../validators'

import { 
    Schema, 
    SchemaInput, 
    SchemaOutput, 
    SubValidators, 
    $$main, 
    $$sub 
} from './schema'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$builder = Symbol('pipe-builder-validator')

//// Types ////

type SchemaPipeBuilder<V extends Validator> = PipeValidatorBuilder<SchemaOutput<V>, SchemaOutput<V>>
type SchemaBuilderValidator<V extends Validator> = OutputValidator<SchemaOutput<V>>
type SchemaBuilderValidatorSettings<V extends Validator> = OutputValidatorSettings<SchemaOutput<V>>
type SchemaBuilderValidatorErrorMessage<V extends Validator> = ValidationErrorMessage<SchemaOutput<V>>
type SchemaBuilderValidatorPredicate<V extends Validator> = OutputValidatorPredicate<SchemaOutput<V>>
type SchemaBuilderValidatorTransform<V extends Validator> = OutputValidatorTransform<SchemaOutput<V>>
type SchemaBuilderMethods<V extends Validator> = PipeValidatorBuilderMethods<SchemaOutput<V>>

//// Main ////

class SchemaBuilder<V extends Validator, S extends SubValidators<V>> 

    extends Schema<V,S>

    implements PipeValidatorBuilderMethods<SchemaOutput<V>> {

    static readonly builder: typeof $$builder = $$builder

    override [Validator.analyze](ctx: ValidationContext<SchemaInput<V>, SchemaOutput<V>>) {
        
        ctx = super[Validator.analyze](ctx)
        if (!ctx.hasError() && !ctx.hasSubContextError())
            ctx = this[$$builder][Validator.analyze](ctx as ValidationContext)
        
        return ctx
    }

    protected [$$builder]: SchemaPipeBuilder<V> = PipeValidatorBuilder.empty()

    //// Public Builder Methods ////

    validates(validator: SchemaBuilderValidator<V>): this
    validates(settings: SchemaBuilderValidatorSettings<V>): this
    validates<T extends SchemaBuilderValidatorSettings<V>>(validator: T): this
    validates( ...params: unknown[]): this {
        return this._applyBuilderValidator(
            'validates', 
            params as Parameters<SchemaBuilderMethods<V>['validates']>
        )
    }

    asserts(
        isValid: SchemaBuilderValidatorPredicate<V>,
        id?: symbol
    ): this 
    asserts(
        isValid: SchemaBuilderValidatorPredicate<V>,
        message?: string | SchemaBuilderValidatorErrorMessage<V>,
        id?: symbol
    ): this 
    asserts(...params: unknown[]): this {
        return this._applyBuilderValidator(
            'asserts', 
            params as Parameters<SchemaBuilderMethods<V>['asserts']>
        )
    }

    transforms(
        transform: SchemaBuilderValidatorTransform<V>,
        id?: symbol
    ): this 
    transforms(
        transform: SchemaBuilderValidatorTransform<V>,
        message?: string | ValidationErrorMessage<V>,
        id?: symbol
    ): this 
    transforms(...params: unknown[]): this {
        return this._applyBuilderValidator(
            'transforms', 
            params as Parameters<SchemaBuilderMethods<V>['transforms']>
        )
    }

    remove(id: symbol): this {
        return this._applyBuilderValidator('remove', [id])
    }

    //// Builder Helpers ////

    protected _applyBuilderValidator<K extends keyof SchemaBuilderMethods<V>>(
        method: K,
        params: Parameters<SchemaBuilderMethods<V>[K]>
    ): this {

        type BuilderMethod = (...p: Parameters<SchemaBuilderMethods<V>[K]>) => ReturnType<SchemaBuilderMethods<V>[K]>

        return Validator.applyState(
            this,
            $$builder,
            (this[$$builder][method] as BuilderMethod)(...params) as any
        )
    }

    //// Settings ////
    
    get [Structural.state](): {
        [$$main]: V
        [$$sub]: S
        [$$builder]: SchemaPipeBuilder<V>
    } {
        return {
            [$$main]: this[$$main],
            [$$sub]: this[$$sub],
            [$$builder]: this[$$builder]
        }
    }

    set [Structural.state](state: {
        [$$main]: V
        [$$sub]: S
        [$$builder]: SchemaPipeBuilder<V>
    }) {
        assign(this, state)
    }
}

//// Exports ////

export default SchemaBuilder

export {

    SchemaBuilder,
    SchemaPipeBuilder,

    $$builder
}