import {
    Callable,
    CallableContextProvider,

    Func, 
    isFunc, 

    nil, 

    Property, 
    provideCallableContext
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

//// StructBase ////

abstract class Struct implements ValueCopy, ValueEqual {

    static copy<S extends Struct>(input: S): S {
        return Object.create(input)
    }

    static initialize<S extends Struct>(input: S, state?: Partial<S>, signature?: Func, provider?: CallableContextProvider<Func>): S {
        const output = (signature  
            ? Callable.create(signature, input, provider)
            : input) as S

        if (state)
            output['state'] = state
    
        return Struct.bindMethods(output as Struct, 'equals', 'copy') as S
    }

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

    protected set state(state: Partial<this>) {
        const stateDescriptors = Property.descriptorsOf(state)

        Property.define(this, stateDescriptors)
    }

    //// Constructor ////
    
    constructor() {
        return Struct.initialize(this)
    }

    //// Copyable ////

    copy(): this {
        return Struct.initialize(Struct.copy(this), this.state)
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

    constructor(signature: Func, ctxProvider: CallableContextProvider<Func> = provideCallableContext) {
        super()
        return Struct.initialize(this, this.state, signature, ctxProvider)
    }

    override copy(): this {
        const struct = Struct.copy(this)

        const callable = this as unknown as Func

        return Struct.initialize(
            struct, 
            this.state, 
            Callable.signatureOf(callable), 
            Callable.contextProviderOf(callable)
        )
    }

} as CallableStruct

//// Exports ////

export default Struct

export {
    Struct,
    CallableStruct
}