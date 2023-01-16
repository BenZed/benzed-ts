import { CallableStruct, Struct } from '@benzed/immutable'
import { isFunc, TypeAssertion, TypeGuard } from '@benzed/util'

import { Validate, Validator, ValidatorSettings } from '../validator'

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

type AnySchematics = readonly AnySchematic[] | AnySchematic[]

type SchematicConstructor = typeof Schematic

//// Main ////

class Schematic<O extends I, I = unknown> 
    extends CallableStruct<TypeGuard<O, I>> 
    implements SchematicMethods<O,I> {

    //// Static Utility ////
    
    static is<Ox extends Ix, Ix = unknown>(input: unknown): input is Schematic<Ox,Ix> {
        return isFunc<Schematic<Ox,Ix>>(input) &&
            isFunc(input.is) &&
            isFunc(input.assert) &&
            isFunc(input.validate)
    }

    //// Constructor ////

    constructor(validate: Validate<I,O>)
    constructor(settings: Partial<ValidatorSettings<I,O>>)
    constructor(input: Validate<I,O> | Partial<ValidatorSettings<I,O>>) {

        super(function (this: Schematic<O>, i): i is O {
            return this.is(i)
        })

        this.validate = Validator.from(input)
        Struct.bindMethods(this as Schematic<unknown>, 'is', 'assert')
    }

    //// Schematic Methods ////

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

}

//// Exports ////

export default Schematic 

export {
    Schematic,
    SchematicMethods,
    SchematicConstructor,

    AnySchematic,
    AnySchematics
}