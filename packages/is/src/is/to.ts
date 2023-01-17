
import { Infer } from '@benzed/util'
import { 
    AnySchematic, 

    Array,
    isArray,
    Boolean,
    isBoolean,
    
    Number,
    isNumber, 

    String,
    isString,
} from '../schema'
import { Is } from './is'

import { 
    ResolveSchematic,
    ResolveSchematicMap,

    reduceSchematics, 
    ReduceSchematicsInput, 
    ReduceSchematicsOutput
} from './util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Types ////

type IsResolved<F extends readonly AnySchematic[], T extends ReduceSchematicsInput> = Infer<Is<ReduceSchematicsOutput<[...F, ...T]>>, AnySchematic>
    
interface ToSignature<F extends readonly AnySchematic[]> {
    <T extends ReduceSchematicsInput>(
        ...inputs: T
    ): IsResolved<F,T>
}

//// Implementation ////

class To<F extends readonly AnySchematic[]> 
    extends ResolveSchematic<ToSignature<F>> 
    implements ResolveSchematicMap {

    readonly from: F

    constructor(...from: F) {
        super(function (
            this: To<F>, 
            ...inputs: ReduceSchematicsInput
        ) {
            return new Is(
                reduceSchematics(
                    ...this.from, 
                    ...inputs
                )
            )
        })

        this.from = from
    }
    
    get string(): IsResolved<F, [String]> {
        return this(isString)
    }

    get number(): IsResolved<F, [Number]> {
        return this(isNumber)
    }

    get boolean(): IsResolved<F, [Boolean]> {
        return this(isBoolean)
    }

    get array(): IsResolved<F, [Array]> {
        return this(isArray)
    }

}

//// Exports ////
    
export {
    To,
    ToSignature
}