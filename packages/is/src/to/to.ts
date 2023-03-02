import { Infer } from '@benzed/util'
import { Method } from '@benzed/traits'
import { ModifierType, Validator } from '@benzed/schema'
import { pluck } from '@benzed/array'

import { Is } from '../is'

import {
    String,
    $string,

    Boolean,
    $boolean,
    
    Number,
    $number, 
} from '../schemas'

import {
    resolveValidator, 
    ResolveValidator,
    ResolveValidatorsInput 
} from './resolve-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

export enum OfType {
    Record = 'Record',
    Array = 'Array',
    // Set,
    // Map
}

type From = [Validator] | []

type Clause = [OfType | ModifierType] | []

//// Helper ////

interface ToSignature<F extends From, C extends Clause> {
    <T extends ResolveValidatorsInput>(...inputs: T): IsTo<F, ResolveValidator<T>>
}

function to<T extends ResolveValidatorsInput, F extends From, C extends Clause>(
    this: To<F,C>,
    ...inputs: T
): IsTo<F, ResolveValidator<T>> {

    const validator = resolveValidator(...inputs)

    return new Is(validator)
}

type IsTo<F extends From, T extends ResolveValidatorsInput> = 
    Is<Infer<ResolveValidator<[...F, ...T]>, Validator>>

//// Main ////

class To<F extends From, C extends Clause> extends Method<ToSignature<F,C>> {

    /**
     * @internal
     */
    readonly _from: F
    
    /**
     * @internal
     */
    readonly _clause: C

    constructor(...args: [...F, ...C]) {
        super(to)
        this._from = pluck(args, Validator.is) as F
        this._clause = args as unknown as C
    }

    get optional() {
        return this()
    }

    get not() {
        return this()
    }

    get string(): Is<String> {
        return new Is($string)
    }

    get boolean(): Is<Boolean> {
        return new Is($boolean)
    }

    get number(): Is<Number> {
        return new Is($number)
    }

}

//// Exports ////

export default To

export {
    To
}