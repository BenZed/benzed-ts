import { 
    OutputOf, 
    pick 
} from '@benzed/util'

import { 
    ValidateOptions 
} from '../../../validate'

import { 
    $$settings, 
    AnyValidateStruct, 
    ValidateSettings, 
    ValidateStruct 
} from '../../validate-struct'

import {
    PipeValidatorBuilder,
    PipeValidatorBuilderMethods
} from '../pipe-validator-builder'

import Schema, { $$main, $$sub, SubValidators } from './schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbols ////

const $$builder = Symbol('pipe-schema-builder')

//// Helper Types ////

type _BuilderParams<T, K extends keyof PipeValidatorBuilderMethods<T>> = 
    Parameters<PipeValidatorBuilderMethods<T>[K]> 

//// Types ////

interface SchemaBuilderConstructor {
    new <M extends AnyValidateStruct>(main: M): SchemaBuilder<M, {}>
    new <M extends AnyValidateStruct, S extends SubValidators<OutputOf<M>>>(
        main: M,
        sub: S
    ): SchemaBuilder<M, S>
}

type SchemaBuilder<T extends AnyValidateStruct, S extends SubValidators<OutputOf<T>>> = 
    PipeValidatorBuilderMethods<OutputOf<T>> & 
    Schema<T,S>

//// Helper ////

function applyBuilderValidator<
    T extends AnyValidateStruct, 
    K extends keyof PipeValidatorBuilderMethods<any>,
>(
    input: T, 
    method: keyof PipeValidatorBuilderMethods<T>,
    ...args: Parameters<PipeValidatorBuilderMethods<T>[K]>
): T {

    const builder = (input as any)[$$builder]

    return ValidateStruct.applySettings(
        input,
        {
            [$$builder]: builder[method](...args)
        } as ValidateSettings<T>
    ) as T
}

//// Implementation ////

const SchemaBuilder = class extends Schema<any, never> {

    validate(input: any, options: ValidateOptions): any {
        let output: any = super.validate(input, options)

        output = this[$$builder].validate(output, options)

        return output
    }

    protected [$$builder]: PipeValidatorBuilder<unknown> = PipeValidatorBuilder.empty()

    asserts( ...args: _BuilderParams<any, 'asserts'>): this {
        return applyBuilderValidator(this, 'asserts', ...args)
    }

    transforms( ...args: _BuilderParams<any, 'transforms'>): this {
        return applyBuilderValidator(this, 'transforms', ...args)
    }

    validates( ...args: _BuilderParams<any, 'validates'>): this {
        return applyBuilderValidator(this, 'validates', ...args)
    }

    override get [$$settings](): any {
        return pick(this, $$builder, $$main, $$sub)
    }

} as unknown as SchemaBuilderConstructor

//// Exports ////

export {
    SchemaBuilder,
    SchemaBuilderConstructor,
    $$builder
}