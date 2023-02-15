
import { ValidateOptions } from '../../../validate'
import { ValidationErrorMessage } from '../../../validation-error'
import { AnyValidatorStruct } from '../../validator-struct'
import { $$settings, ValidateStruct, ValidateUpdateSettings } from '../../validate-struct'

import { 
    PipeValidatorBuilder, 
    PipeValidatorBuilderMethods,
    OutputValidator,
    OutputValidatorSettings,
    OutputValidatorPredicate,
    OutputValidatorTransform
} from '../pipe-validator-builder'

import { 
    Schema, 
    SchemaInput, 
    SchemaOutput, 
    SubValidators, 
    $$main, 
    $$sub 
} from './schema'

//// Symbols ////

const $$builder = Symbol('pipe-builder-validator')

//// Types ////

type SchemaPipeBuilder<V extends AnyValidatorStruct> = PipeValidatorBuilder<SchemaOutput<V>, SchemaOutput<V>>
type SchemaBuilderValidator<V extends AnyValidatorStruct> = OutputValidator<SchemaOutput<V>>
type SchemaBuilderValidatorSettings<V extends AnyValidatorStruct> = OutputValidatorSettings<SchemaOutput<V>>
type SchemaBuilderValidatorErrorMessage<V extends AnyValidatorStruct> = ValidationErrorMessage<SchemaOutput<V>>
type SchemaBuilderValidatorPredicate<V extends AnyValidatorStruct> = OutputValidatorPredicate<SchemaOutput<V>>
type SchemaBuilderValidatorTransform<V extends AnyValidatorStruct> = OutputValidatorTransform<SchemaOutput<V>>
type SchemaBuilderMethods<V extends AnyValidatorStruct> = PipeValidatorBuilderMethods<SchemaOutput<V>>

//// Main ////

class SchemaBuilder<V extends AnyValidatorStruct, S extends SubValidators<V>> 

    extends Schema<V,S>

    implements PipeValidatorBuilderMethods<SchemaOutput<V>> {

    override validate(input: SchemaInput<V>, options: ValidateOptions): SchemaOutput<V> {
        let output = super.validate(input, options)
        output = this[$$builder].validate(output, options)
        return output
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

        return ValidateStruct.applySettings(
            this,
            {
                [$$builder]: (this[$$builder][method] as BuilderMethod)(...params)
            } as ValidateUpdateSettings<this>
        )
    }

    //// Settings ////
    
    override get [$$settings](): {
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
    
}

//// Exports ////

export default SchemaBuilder

export {

    SchemaBuilder,
    SchemaPipeBuilder,

    $$builder
}