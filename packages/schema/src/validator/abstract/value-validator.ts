
import SubValidator, { NameErrorIdSignature } from './sub-validator'

//// Main ////

abstract class ValueValidator<T> extends SubValidator<T> {

    constructor(readonly value: T, ...args: NameErrorIdSignature<T>) {
        super(...args)
    }

}

//// Exports ////

export default ValueValidator

export {
    ValueValidator,
}