import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { callable, isObject } from '@benzed/util'

//// Value ////

export class Type<T = unknown> implements CopyComparable {

    constructor(protected readonly _value: T) {}
    
    [$$equals](input: unknown): input is this {
        return isObject(input) && 
                callable.isInstance(input, Type) && 
                input.constructor === this.constructor &&
                equals(input._value, this._value)
    }
    
    [$$copy](): this {
        const Constructor = this.constructor as new (value: T) => this
        return new Constructor(this._value)
    }

}

//// Exports ////

export default Type 
