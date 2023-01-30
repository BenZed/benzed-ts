
import { assign } from '@benzed/util'
import SubValidator, { NameErrorIdSignature } from './sub-validator'

//// Main ////

type SimpleValidator<T, K extends string> = SubValidator<T> & { [Kk in K]: T } & { get key(): K }

type SimpleValidatorConstructor = 
    (abstract new <T, K extends string>(
        key: K,
        value: T, 
        ...args: NameErrorIdSignature<T>
    ) => SimpleValidator<T, K>)

const SimpleValidator = class <T> extends SubValidator<T> {

    constructor(key: string, value: T, ...args: NameErrorIdSignature<T>) {
        super(...args)

        assign(this, { [key]: value })
    }

} as unknown as SimpleValidatorConstructor

//// Convenience ////

class ValueValidator<T> extends SimpleValidator<T, 'value'> {
    constructor(value: T, ...args: NameErrorIdSignature<T>) {
        super('value', value, ...args)
    }
}
//// Exports ////

export default SimpleValidator

export {
    SimpleValidator,
    ValueValidator
}