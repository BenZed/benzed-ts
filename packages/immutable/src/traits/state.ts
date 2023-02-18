import { Trait } from '@benzed/traits'
import { AnyTypeGuard, isKeyed } from '@benzed/util'

//// Sybol ////

const $$state = Symbol('state')

//// Types ////

type StateOf<T extends State> = T[typeof $$state]

//// Main ////

/**
 * Stateful trait allows custom logic for getting/setting
 * an object's state.
 */
abstract class State extends Trait {

    /**
     * Set the state of an object using the State trait
     */
    static set<T extends State>(object: T, state: StateOf<T>): void {
        object[$$state] = state
    }

    /**
     * Get the state of an object using the State trait
     */
    static get<T extends State>(object: T): StateOf<T> {
        return object[$$state]
    }

    static override readonly is: (input: unknown) => input is State = 
        isKeyed($$state) as AnyTypeGuard

    /**
     * The symbolic key for the state accessor trait users need 
     * to implement
     */
    static readonly key: typeof $$state = $$state

    //// Stateful ////

    abstract get [$$state](): unknown

    protected abstract set [$$state](input: unknown)

}

export {
    StateOf,
    State
}