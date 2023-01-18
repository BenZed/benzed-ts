
import { Callable, Infer, merge } from '@benzed/util'
import { Last } from '@benzed/array'

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
    ArrayOf,
    IterableOf,

    Instance,
    InstanceInput, 

    Tuple,
    Shape,
    ShapeInput
} from '../../schema'

import { 
    AnyTypeGuard, 
    TypeOf 
} from '../../schema/schemas/type-of/type-of'

import { Is } from '../is'
import { Or, _ReplaceLast } from '../or'

import { Validator, TypeValidator } from '../../validator'

import { 
    resolveSchematics,
    ResolveSchematicsInput,
    ResolveSchematicsOutput
} from './resolve-schematics'

import { 
    reduceSchematics, 
    ReduceSchematicsInput, 
    ReduceSchematicsOutput,
} from './reduce-schematics'

import { Optional } from '../optional'
import { ReadOnly } from '../readonly'
import Ref from '../ref'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type _OfArray<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends AnySchematic & { of: AnySchematic }
        ? ArrayOf<_Of<F, T>>
        : ArrayOf<T>

type _Of<F extends AnySchematic, T extends AnySchematic> = 
    F extends ArrayOf<infer Fx>
        ? _OfArray<Fx, T>

        // Also check MapOf, SetOf, RecordOf
        : F extends TypeOf<infer Fxx, any>  
            ? IterableOf<Fxx>
            : F

// type Of<O extends AnySchematic, T extends AnySchematic> = _Of<O, T>

// TODO: this is hairy
type Of<O extends AnySchematic, T extends AnySchematic> = 
    O extends Optional<infer Tx> 
        ? Optional<Of<Tx, T>>
        : O extends ReadOnly<infer Txx>     
            ? ReadOnly<Of<Txx,T>>
            : O extends Or<infer Txxx> 
                // TODO fix me
                ? Or<_ReplaceLast<Txxx, Of<Last<Txxx>, T>>>
                : _Of<O, T>

// TODO clean this up, this is hacky as fuck and prone to bugs
function resolveOf(from: From, of: AnySchematic): AnySchematic {

    let type = from[0] ?? Ref.prototype

    // Remove Modifiers
    type Modifier = (new (input: AnySchematic) => Ref<unknown>)
    const modifiers = new Set<Modifier>()
    const or: AnySchematic[] = []
    while (type instanceof Ref) {

        if (type instanceof Or)
            or.push(...type.types.slice(0, -1))

        modifiers.add(type.constructor as Modifier)
        type = type.ref
    }

    if (!(type instanceof TypeOf))
        throw new Error(`input must be a ${TypeOf.name} instance when placing items in a collection.`)

    // Create clone with new "of"
    let clone = type.copy()

    // get the endpoint
    let curr = clone
    while (curr.of instanceof TypeOf) 
        curr = curr.of
    
    // hack the type validator on the endPoint to use the new 'of'
    merge(curr,
        {
            validate: Validator.from(
                ...curr['_upsertValidatorByType'](
                    TypeValidator, 
                    t => new TypeValidator({ ...t, of } as any)
                )
            )
        }
    )

    // Re-Apply Mofifiers
    for (const Modifier of modifiers) {
        clone = (Modifier === Or 
            ? new Or(...or, clone)
            : new Modifier(clone)) as any
    }

    return clone
}

//// Types ////

type ToOutput<F extends From, O extends boolean, T extends ReduceSchematicsInput> = 
    Infer<

    Is<
    O extends true 
        ? F[0] extends { of: AnySchematic } 
            ? Of<F[0], ReduceSchematicsOutput<T>>
            : never
        : ReduceSchematicsOutput<[...F, ...T]>
    >

    , AnySchematic>

interface ToSignature<F extends From, C extends boolean> {
    <T extends ResolveSchematicsInput>(
        ...inputs: T
    ): ToOutput<F, C, ResolveSchematicsOutput<T>>
}

interface ToIs extends To<[], false> {}
interface ToOr<F extends AnySchematic> extends To<[F], false> {}
interface ToOf<F extends AnySchematic> extends To<[F], true> {}

type From = [AnySchematic] | []

//// Implementation ////

class To<F extends From, O extends boolean> extends Callable<ToSignature<F, O>> {

    static get is(): ToIs {
        return new To(false)
    }

    static or<T extends AnySchematic>(type: T): ToOr<T> {
        return new To(false, type)
    }

    static of<T extends AnySchematic>(type: T): ToOf<T> {
        return new To(true, type)
    }

    readonly from: F

    private constructor(private readonly _of: O, ...from: F) {

        super(function (
            this: To<F, O>, 
            ...inputs: ResolveSchematicsInput
        ) {

            const resolved = resolveSchematics(...inputs)
            const reduced = this._of 
                ? reduceSchematics(...resolved)
                : reduceSchematics(...this.from, ...resolved)

            const container = this._of
                ? resolveOf(this.from, reduced)
                : reduced

            return new Is(container)
        } as any)

        this.from = from
    }
    
    get string(): ToOutput<F, O, [String]> {
        return this(isString)
    }

    get number(): ToOutput<F, O, [Number]> {
        return this(isNumber)
    }

    get boolean(): ToOutput<F, O, [Boolean]> {
        return this(isBoolean)
    }

    get array(): ToOutput<F, O, [Array]> {
        return this(isArray)
    }

    tuple<T extends ResolveSchematicsInput>(
        ...input: T
    ): ToOutput<F, O, [Tuple<ResolveSchematicsOutput<T>>]> {
        return this(new Tuple(...resolveSchematics(...input)))
    }

    shape<T extends ResolveShapeInput>(
        shape: T
    ): ToOutput<F, O, [Shape<ResolveShapeOutput<T>>]> {
        return this(new Shape(shape))
    }

    instance<T extends InstanceInput>(type: T): ToOutput<F, O, [Instance<T>]> {
        return this(new Instance(type))
    }

}

//// Exports ////
    
export {
    To,
    ToIs,
    ToOf,
    ToOr,
    ToSignature
}