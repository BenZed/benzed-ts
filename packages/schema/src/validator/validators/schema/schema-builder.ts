import { applyState } from '@benzed/immutable'
import { InputOf, nil, OutputOf, through } from '@benzed/util'

import { AnyValidateStruct } from '../../validate-struct'
import PipeValidator from '../pipe-validator'

import { PipeValidatorBuilder, PipeValidatorBuilderMethods } from '../pipe-validator-builder'

import Schema, { AnySubValidators, SubValidators } from './schema'

//// Symbols ////

const $$builder = Symbol('pipe-schema-builder')

//// Types ////

interface SchemaBuilderConstructor {
    new <T extends AnyValidateStruct, S extends SubValidators<OutputOf<T>>>(): SchemaBuilder<T,S>
}

type SchemaBuilder<T extends AnyValidateStruct, S extends SubValidators<OutputOf<T>>> = 
    Schema<T,S> & PipeValidatorBuilderMethods<OutputOf<T>>

type BuilderParams<T, K extends keyof PipeValidatorBuilderMethods<T>> = Parameters<PipeValidatorBuilderMethods<T>[K]> 

//// Implementation ////

const SchemaBuilder = class SchemaBuilder extends Schema<any, any> {

    protected [$$builder]: PipeValidatorBuilder<unknown>

    constructor(main: AnyValidateStruct, sub: AnySubValidators) {
        super(main, sub)
        this[$$builder] = new PipeValidatorBuilder()
    }

    asserts(... args: BuilderParams<unknown, 'asserts'>): this {
        // return applyState(this, {
        //     [$$builder]: 
        // })
    }

    transforms(... args: BuilderParams<unknown, 'transforms'>): this {
        return this
    }

    validates(... args: BuilderParams<unknown, 'validates'>): this {
        return this
    }

} as unknown as SchemaBuilderConstructor

//// Exports ////

export default SchemaBuilder

export {
    SchemaBuilder
}