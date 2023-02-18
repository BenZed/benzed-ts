import { Traits } from '@benzed/traits'
import { assign, NamesOf, omit } from '@benzed/util'
import { copy, equals, StructState, StructStateApply, StructStatePath, Structural } from '../traits'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/ 

//// PublicStruct ////

/**
 * State preset for a generic objects.
 * Any property is considered state, so long as it isn't an object prototype property.
 */
export type PublicStructState<T extends object> = 
    Pick<
    T,
    Exclude<NamesOf<T>, 'toString' | 'valueOf' | 'copy' | 'equals' | 'get' | 'apply'>
    >

/**
 * A public struct is a structural object with a public interface for immutable operations
 * It assumes that any non-public-interface key is state.
 */
export abstract class PublicStruct extends Traits.use(Structural) {

    //// Public Immutability Interface ////

    get<P extends StructStatePath>(...path: P): StructState<this, P> {
        return Structural.getIn(this, ...path)
    }

    apply<P extends StructStatePath>(...pathAndState: [...path: P, state: StructStateApply<this, P>]): this {
        return Structural.apply(this, ...pathAndState)
    }

    copy(): this {
        return copy(this)
    }

    equals(other: unknown): other is this {
        return equals(this, other)
    }

    //// Structural Implemenation ////
    
    get [Structural.key](): PublicStructState<this> {
        return omit(
            this, 
            'toString', 
            'valueOf',
            'get',
            'apply',
            'copy',
            'equals'
        ) as PublicStructState<this>
    }

    protected set [Structural.key](state: PublicStructState<this>) {
        assign(this, state)
    }

}
