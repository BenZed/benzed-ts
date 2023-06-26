
//// EsLint ////

import { Func } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type Instancer<T extends object> = (new (...p: any) => T) | (abstract new (...p: any) => T) | typeof PrivateState<T, any>

//// Module State ////

const privateStates = new WeakMap<object, PrivateState<object, unknown>>()

//// Main ////

class PrivateState<T extends object, S> {

    static for<Tx extends object, Sx>(type: Instancer<Tx>): PrivateState<Tx, Sx>
    static for<Sx>(method: Func): PrivateState<Object, Sx>
    static for<Tx extends object, Sx>(key: Instancer<Tx> | Func): PrivateState<Tx, Sx> {
        let privateState = privateStates.get(key)
        if (!(privateState instanceof PrivateState)) {
            privateState = new PrivateState(key)
            privateStates.set(key, privateState)
        }
        
        return privateState as PrivateState<Tx, Sx>
    }

    private readonly _states: WeakMap<T, S> = new WeakMap()

    private constructor(readonly key: Func | Instancer<object> = Object) {}

    get(instance: T): S {
        if (!this._states.has(instance))
            throw new Error(`No state for ${this.key.name}`)

        return this._states.get(instance) as S
    }

    set(instance: T, state: S): this {
        this._states.set(instance, state)
        return this
    }

    has(instance: T): boolean {
        return this._states.has(instance)
    }

    delete(instance: T): boolean {
        return this._states.delete(instance)
    }

}

//// Exports ////

export default PrivateState

export {
    PrivateState
}