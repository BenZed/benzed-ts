import { Async, toAsync } from './types'
import { Method } from '@benzed/traits'

//// Types ////

type AsyncState<T> = 
    { status: 'idle' } | 
    { status: 'pending', promise: Async<T> } | 
    { status: 'resolved', value: T } | 
    { status: 'rejected', error: Error }

//// Helper ////

export type HasAsyncState<S extends AsyncState<unknown>> = { state: S }
    
class Guarantee<A extends unknown[], R> extends Method<(...args: A) => Async<R>> {

    protected _state: AsyncState<R> = { status: 'idle' }
    get state(): AsyncState<R> {
        return this._state
    }

    constructor(readonly func: (...args: A) => R | Async<R>) {
        super(function (this: unknown, ...args) {

            switch (guarantee.state.status) {
        
                case 'idle': {
        
                    const promise = toAsync(guarantee.func.apply(this, args))
                        .then(value => {
                            guarantee['_state'] = { status: 'resolved', value }
                            return value
                        })
                        .catch(error => {
                            guarantee['_state'] = { status: 'rejected', error }
                            return Promise.reject(error)
                        })
        
                    guarantee['_state'] = { 
                        status: 'pending',
                        promise
                    }
        
                    return promise
                }
                    
                case 'pending': {
                    return guarantee.state.promise
                }
        
                case 'rejected': {
                    return Promise.reject(guarantee.state.error)
                }
        
                case 'resolved': {
                    return Promise.resolve(guarantee.state.value)
                }
        
                default: {
                    const statusBad: never = guarantee.state
                    throw new Error(`${statusBad} is an invalid option.`)
                }
            }

        })

        const guarantee = this
    }

    isIdle(): this is HasAsyncState<{ status: 'idle' }> {
        return this._state.status === 'idle'
    }

    isPending(): this is HasAsyncState<{ status: 'pending', promise: Async<R> }> {
        return this._state.status === 'pending'
    }

    isResolved(): this is HasAsyncState<{ status: 'resolved', value: R }> {
        return this._state.status === 'resolved'
    }

    isRejected(): this is HasAsyncState<{ status: 'rejected', error: Error }> {
        return this._state.status === 'rejected'
    }
    
    isFulfilled(): this is HasAsyncState<{ status: 'rejected', error: Error } | { status: 'resolved', value: R }> {
        return this.isRejected() || this.isResolved()
    }

    get value(): R {

        if (this.isResolved())
            return this.state.value

        const message = this.isRejected() 
            ? this.state.error.message
            : `${this.name || 'guaranteur method'} has not fulfilled.`

        throw new Error(message)
    }

    reset(): void {
        if (!this.isFulfilled()) {
            throw new Error(
                `${this.name || 'guaranteur method'} cannot be reset until it is fulfilled.`
            )
        }

        this._state = { status: 'idle' }
    }

}

export {
    Guarantee
}