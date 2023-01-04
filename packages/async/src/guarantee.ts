import { callable, Func } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Type ////

type PromiseState<T> = 
    { status: 'idle' } | 
    { status: 'pending', promise: Promise<T> } | 
    { status: 'resolved', value: T } | 
    { status: 'rejected', error: Error }

interface Guarantee<F extends Func> {

    (...args: Parameters<F>): ReturnType<F>

    get isIdle(): boolean
    get isPending(): boolean 
    get isResolved(): boolean 
    get isRejected(): boolean
    get isFulfilled(): boolean

    get value(): Awaited<ReturnType<F>>

    reset(): void 
}

interface GuaranteeConstructor {
    new <F extends () => unknown>(f: F): Guarantee<F>
}

//// Implementation ////

const Guarantee = callable(
    function guaranteur(this, ...args) {

        const state = this['_state']
        switch (state.status) {
        
            case 'idle': {

                const promise = Promise
                    .resolve(this.func.apply(callable.getContext(this), args))
                    .then(value => {
                        this['_state'] = { status: 'resolved', value }
                        return value
                    })
                    .catch(error => {
                        this['_state'] = { status: 'rejected', error }
                        return Promise.reject(error)
                    })

                this['_state'] = { 
                    status: 'pending',
                    promise: promise
                }

                return promise
            }
            
            case 'pending': {
                return state.promise
            }

            case 'rejected': {
                return Promise.reject(state.error)
            }

            case 'resolved': {
                return Promise.resolve(state.value)
            }

            default: {
                const statusBad: never = state
                throw new Error(`${statusBad} is an invalid option.`)
            }
        }

    },
    class _Guarantee {

        constructor(readonly func: Func) { }

        get name (): string {
            return this.func.name || 'guaranteur method'
        }

        protected _state: PromiseState<unknown> = { status: 'idle' }

        get isIdle(): boolean {
            return this._state.status === 'idle'
        }
        get isPending(): boolean {
            return this._state.status === 'pending'
        }
        get isResolved(): boolean {
            return this._state.status === 'resolved'
        }
        get isRejected(): boolean {
            return this._state.status === 'rejected'
        }
        get isFulfilled(): boolean {
            return this.isRejected || this.isResolved
        }

        get value(): any {
            const { _state: state } = this 

            if ('value' in state)
                return state.value

            const message = 'error' in state
                ? state.error.message
                : `${this.name} has not fulfilled.`

            throw new Error(message)
        }

        reset(): void {
            if (!this.isFulfilled) {
                throw new Error(
                    `${this.name} cannot be reset until it is fulfilled.`
                )
            }

            this._state = { status: 'idle' }
        }

    },
    'Guarantee'
) as GuaranteeConstructor

//// Exports ////

export default Guarantee

export {
    Guarantee
}