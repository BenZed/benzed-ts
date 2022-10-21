
import Schema from './schema'

import {
    Flags,
    AddFlag,
    HasMutable,
    HasOptional
} from './flags'

import { TypeValidator } from '../validator/type'
import { TypeGuard } from '@benzed/util'

/*** Types ***/

type GenericSchemaInput = TypeGuard<unknown> 

type GenericSchemaOutput<I> = I extends TypeGuard<infer O> 
    ? O 
    : unknown

/*** Main ***/

class GenericSchema<
    I extends GenericSchemaInput,
    O extends GenericSchemaOutput<I>,
    F extends Flags[] = []
>
    extends Schema<TypeGuard<O>, O, F> {

    protected _typeValidator = new TypeValidator<O>({

        name: this._input.name.replace(/^is/, ``) || `unknown`,
        //    ^ isType -> Type

        error: (value, typeName, article) => typeName === `unknown` 
            ? `${value} is invalid` 
            : `must be ${article ? article + ` ` + typeName : typeName}`,

        is: this._input
    })

    constructor (input: TypeGuard<O>, ...flags: F) {
        super(input, ...flags)
    }

    override readonly optional!: HasOptional<
    /**/ F, never, GenericSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    override readonly mutable!: HasMutable<
    /**/ F, never, GenericSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    override readonly clearFlags!: () => GenericSchema<I,O>

}

/*** Expors ***/

export default GenericSchema

export {
    GenericSchema,
    GenericSchemaInput,
    GenericSchemaOutput
}