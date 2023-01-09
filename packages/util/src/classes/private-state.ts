
//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type Instancer<T extends object> = (new (...p: any) => T) | (abstract new (...p: any) => T) | typeof PrivateState<T, any>

const privateStates = new WeakMap<object, PrivateState<object, unknown>>()

//// Main ////

class PrivateState<T extends object, S> {

    static for<Tx extends object, Sx>(type: Instancer<Tx>): PrivateState<Tx, Sx> {
        let privateState = privateStates.get(type)
        if (!(privateState instanceof PrivateState)) {
            privateState = new PrivateState(type)
            privateStates.set(type, privateState)
        }
        
        return privateState as PrivateState<Tx, Sx>
    }

    static get<S>(object: object): S {
        return this.for(Object).get(object) as S
    }

    static has(object: object): boolean {
        return this.for(Object)._states.has(object)
    }

    static set<S>(object: object, value: S): typeof PrivateState {
        this.for(Object).set(object, value)
        return this
    }

    static delete(object: object): boolean {
        return this.for(Object).delete(object)
    }

    private readonly _states: WeakMap<T, S> = new WeakMap()

    private constructor(readonly type: Instancer<T> = Object as unknown as Instancer<T>) {}

    get(instance: T): S {
        if (!this._states.has(instance))
            throw new Error(`No state for ${this.type.name}`)

        return this._states.get(instance) as S
    }

    set(instance: T, state: S): this {
        this._assertType(instance)
        this._states.set(instance, state)
        return this
    }

    delete(instance: T): boolean {
        this._assertType(instance)
        return this._states.delete(instance)
    }

    //// Helper ////
    
    private _assertType(instance: object): asserts instance is T {
        if (instance instanceof this.type === false)
            throw new Error(`Must be an instance of ${this.type.name}`)
    }

}

//// Exports ////

export default PrivateState

export {
    PrivateState
}