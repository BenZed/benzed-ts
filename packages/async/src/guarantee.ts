import { callable, Func, isString } from '@benzed/util'

import { ToAsync } from './types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

////  ////

interface Guarantee<F extends Func> {
    (...args: Parameters<F>): ReturnType<F>
    invoked: boolean
    error: string | Error
    get isFulfilled(): boolean
    get resolved(): Awaited<ReturnType<F>>
    get promise(): ToAsync<ReturnType<F>>
}

////  ////

const _Guarantee = callable(
    function guaranteur(this, ...args) {
        if (!this.invoked) {
            this.invoked = true
            this.promise = Promise
                .resolve(this.func.apply(callable.getContext(this), args))
                .then(value => {
                    this.isFulfilled = true
                    this._value = value
                    this.promise = Promise.resolve(value)
                    return value
                })
                .catch(error => {
                    this.error = error.message
                    
                })
        }
        return this.promise
    },
    class <F extends Func> {

        constructor(
            readonly func: F,
            public error: string | Error = `${func.name} has not been called.`
        ) { 
            this.promise = Promise.reject(error)
        }

        invoked = false

        promise: Promise<ReturnType<F>>

        isFulfilled = false
        
        /**
         * @internal
         */
        _value!: ReturnType<F>
        get value(): any {
            if (!this.invoked || !this.isFulfilled)
                throw new Error(isString(this.error) ? this.error : this.error.message)

            return this._value
        }
    },
    'Guarantee'
)

/**
 * A guarantee is better than a promise.
 */
export function guarantee<F extends Func>(guaranteer: F, error?: string): Guarantee<F> {
    return new _Guarantee<F>(guaranteer, error) as unknown as Guarantee<F>
}