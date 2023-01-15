import { CallableStruct, Struct } from '@benzed/immutable'
import { isFunc, isPrimitive, Primitive, TypeAssertion, TypeGuard } from '@benzed/util'

import { Validate, Validator, ValidatorSettings } from '../validator'
import type { IsInstance, IsInstanceInput, IsValue, OrSchematic, OrSchematicInput } from './schemas'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-var-requires
*/

//// Schematic Types ////

interface SchematicMethods<O extends I, I = unknown> {
    is: TypeGuard<O, I>
    assert: TypeAssertion<O, I>
    validate: Validate<I, O> 
}

type AnySchematic = Schematic<any,any>

//// ToSchematic Types ////

type ToSchematicInput = Primitive | IsInstanceInput | AnySchematic // | IsShapeInput | IsTupleInput | IsTypeValidator
type ToSchematic<T extends ToSchematicInput> = 
    T extends Primitive 
        ? IsValue<T>
        : T extends IsInstanceInput 
            ? IsInstance<T>
            : T extends AnySchematic 
                ? T 
                : never

//// ResolveSchematic ////

interface ResolveSchematic {
    <T extends Primitive>(value: T): IsValue<T>
    <T extends IsInstanceInput>(type: T): IsInstance<T>
    <T extends AnySchematic>(schema: T): T
    <T extends OrSchematicInput>(...options: T): OrSchematic<T>
}

//// Main ////

class Schematic<
    O extends I, 
    I = unknown
> extends CallableStruct<TypeGuard<O, I>> implements SchematicMethods<O,I> {

    static is<Ox extends Ix, Ix = unknown>(input: unknown): input is Schematic<Ox,Ix> {
        return isFunc<Schematic<Ox,Ix>>(input) &&
            isFunc(input.is) &&
            isFunc(input.assert) &&
            isFunc(input.validate)
    }

    static resolve = ((...inputs: OrSchematicInput) => {
        const schematics = inputs.map(Schematic.to) as AnySchematic[]
        if (schematics.length === 0)
            throw new Error('At least one input is required.')

        const { Or } = require('./schemas/or') as typeof import('./schemas/or')
        return Or.to(...schematics)
    }) as ResolveSchematic
   
    static to<T extends ToSchematicInput>(input: T): ToSchematic<T> {

        const { IsInstance } = require('./schemas/type/instance') as typeof import('./schemas/type/instance')
        const { IsValue } = require('./schemas/value') as typeof import('./schemas/value')

        const schema = isFunc(input)
            ? Schematic.is(input) 
                ? input
                : new IsInstance(input)
            : isPrimitive(input) 
                ? new IsValue(input)
                : input

        if (!Schematic.is(schema))
            throw new Error('Invalid input.')

        return schema as ToSchematic<T>
    }

    constructor(validate: Validate<I,O>)
    constructor(settings: Partial<ValidatorSettings<I,O>>)
    constructor(input: Validate<I,O> | Partial<ValidatorSettings<I,O>>) {

        super(function (this: Schematic<O>, i): i is O {
            return this.is(i)
        })

        this.validate = Validator.from(input)
        Struct.bindMethods(this as Schematic<unknown>, 'is', 'assert')
    }

    readonly validate: Validate<I, O>

    is(i: I): i is O {
        try {
            void this.assert(i) 
            return true
        } catch {
            return false
        }
    }

    assert(i: I): asserts i is O {
        void this.validate(i, { transform: false }) 
    }

    //// Copy ////
    
    override copy(): this { 
        const clone = super.copy()
        Struct.bindMethods(clone as Schematic<unknown>, 'is', 'assert')
        return clone
    }

    //// Helper ////

}

//// Exports ////

export default Schematic 

export {
    Schematic,
    SchematicMethods,

    AnySchematic,

    ToSchematicInput,
    ToSchematic,

    OrSchematic,
    OrSchematicInput,

    ResolveSchematic,
}