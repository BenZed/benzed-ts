import {
    Callable,
    CallableContextProvider,

    Func, 
    isFunc, 

    Property 
} from '@benzed/util'

import { ValueCopy, $$copy } from './copy'
import equals, { $$equals, ValueEqual } from './equals'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type MethodNames<S> = keyof {
    [K in keyof S as S[K] extends Func ? K : never]: unknown
}

//// Helper Methods ////

function copy<S extends Struct>(input: S): S {
    const stateDescriptors = Property.descriptorsOf(input.state)
    const output = Object.create(input, stateDescriptors) as Struct
    return output as S
}

function initialize<S extends Struct>(input: S, signature?: Func, provider?: CallableContextProvider<Func>): S {
    const output = signature  
        ? Callable.create(signature, input, provider)
        : input 

    return Struct.bindMethods(output as Struct, 'equals', 'copy') as S
}

//// StructBase ////

abstract class Struct implements ValueCopy, ValueEqual {

    /**
     * Bind to a given struct the given methods keys that correspond to method keys on the struct's prototype.
     * Binds all methods if method keys are not provided.
     */
    static bindMethods<S extends Struct, N extends MethodNames<S>[]>(struct: S, ...methodNames: N): S {

        const protos = Property.prototypesOf(
            struct.constructor.prototype, 
            [Object.prototype, Function.prototype]
        ) as any[]
        protos.push(struct.constructor.prototype)
        protos.reverse()
    
        // Get all method names by default

        for (const methodName of methodNames) {

            const proto = protos.find(proto => isFunc(proto[methodName]))
            const method = proto?.[methodName]

            if (!isFunc(method))
                throw new Error(`${String(methodName)} is an invalid method key.`)

            Property.define(
                struct, 
                methodName, 
                {
                    value: method.bind(struct),
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            )
        }

        return struct
    }

    static [Symbol.hasInstance](input: unknown): boolean {
        // So that Structs are also instances of CallableStructs
        return Callable[Symbol.hasInstance].call(this, input)
    }

    //// State ////
    
    get state(): Partial<this> {
        // by default, all enumerable fields are state
        return { ...this } as Partial<this>
    }

    //// Constructor ////
    
    constructor() {
        // TODO perhaps we should add an argument to allow
        // all methods to be bound
        return initialize(this)
    }

    //// Copyable ////

    copy(): this {
        return initialize(copy(this))
    }

    [$$copy](): this {
        return this.copy()
    }

    //// Comparable ////

    /**
     * Returns true if provided value is an instance of this
     * struct with a value equal state.
     */
    equals(other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor && 
            equals(other.state, this.state)
        )
    }
    
    [$$equals](other: unknown): other is this {
        return this.equals(other)
    }

}

//// CallableStruct ////

type CallableStruct = abstract new <F extends Func>(signature: F, ctxProvider?: CallableContextProvider<F>) => F & Struct

const CallableStruct = class extends Struct {

    constructor(signature: Func, ctxProvider?: CallableContextProvider<Func>) {
        super()
        return initialize(this, signature, ctxProvider)
    }

    override copy(): this {
        const struct = copy(this)

        const callable = this as unknown as Func
        const callableSignature = Callable.signatureOf(callable)
        const callableCtxProvider = Callable.contextProviderOf(callable)
        return initialize(struct, callableSignature, callableCtxProvider)
    }

} as CallableStruct

//// Exports ////

export default Struct

export {
    Struct,
    CallableStruct
}