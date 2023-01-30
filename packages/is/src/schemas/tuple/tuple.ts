import {

    AnyValidate,
    toNameErrorId,
    NameErrorIdSignature,

    Schema,

    AbstractValidateWithIdNameError,

    ValidateContext,
    ValidateOptions,
    ValidationError

} from '@benzed/schema'

import { indexesOf, isArray, TypeGuard } from '@benzed/util'

//// Types //// 

type TupleInput = readonly AnyValidate[]

type TupleOutput<T extends TupleInput> = T extends [infer T1, ...infer Tr]
    ? Tr extends TupleInput 
        ? T1 extends TypeGuard<infer O>
            ? [O, ...TupleOutput<Tr>]
            : [unknown, ...TupleOutput<Tr>]
        : T1 extends TypeGuard<infer O> 
            ? [O]
            : [unknown]
    : []

function validateTuple<T extends TupleInput>(
    this: ValidateTuple<T>, 
    input: unknown, 
    options?: Partial<ValidateOptions>
): TupleOutput<T> {
    const ctx = new ValidateContext(input, options)

    if (!isArray(input))
        throw new ValidationError(this, ctx)

    const output: unknown[] = []
    for (const index of indexesOf(this.types)) {

        const type = this.types[index]

        output.push(type(input[index], ctx.push(index)))
    }

    return output as TupleOutput<T>
}

class ValidateTuple<T extends TupleInput> 
    extends AbstractValidateWithIdNameError<unknown, TupleOutput<T>> {

    override error(): string {
        return 'Must be a tuple'
    }

    constructor(readonly types: T, ...args: NameErrorIdSignature<unknown>) {
        const { name = 'tuple', ...rest } = toNameErrorId(...args) ?? {}
        super(validateTuple,{ name, ...rest })
    }

}

//// Tuple //// 

class Tuple<T extends TupleInput> extends Schema<unknown, TupleOutput<T>> {

    override get _mainValidator(): ValidateTuple<T> {
        const [ mainValidator ] = this.validators
        return mainValidator as ValidateTuple<T>
    }

    get types(): T {
        return this._mainValidator.types
    }

    constructor(...types: T) {
        super(new ValidateTuple(types))
    }
}

//// Exports ////

export default Tuple

export {
    Tuple,
    TupleInput,
    TupleOutput
}