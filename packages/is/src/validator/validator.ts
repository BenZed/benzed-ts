import { $$copy, $$equals, Comparable, Copyable, equals } from '@benzed/immutable'
import { applyResolver, ContextTransform, defined, Func, isString, Pipe, Transform } from '@benzed/util'

import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'

//// Shorcuts ////

const { assign } = Object 

//// Types ////

interface ValidatorContext<T> extends Required<ValidateOptions> {
    readonly input: T
    transformed?: T
}

type ValidatorTypeGuard<I, O extends I = I> = 
    ((input: I, ctx: ValidatorContext<I>) => input is O) | 
    ContextTransform<I, boolean, ValidatorContext<I>>

type ValidatorTransform<I, O extends I = I> = ContextTransform<I, I | O, ValidatorContext<I>>

interface ValidatorSettings<I, O extends I = I> {

    is?: ValidatorTypeGuard<I, O>

    transform?: ValidatorTransform<I, O>

    error?: string | ValidationErrorMessage<I>

}

//// Helper ////

function createCtx<I, O extends I = I>(this: Validator<I,O>, input: I, options: ValidateOptions): ValidatorContext<I> {
    return { transform: true, path: [], input, ...options }
}

function applyCtxTransform<I, O extends I>(this: Validator<I, O>, ctx: ValidatorContext<I>): ValidatorContext<I> & { output: I | O } {
    return applyResolver(
        this.transform(ctx.input, ctx), 
        transformed => ({ 
            ...ctx, 
            transformed, 
            output: ctx.transform 
                ? transformed as I
                : ctx.input 
        }) 
    ) as ValidatorContext<I> & { output: I | O }
}

function applyCtxValidate<I, O extends I = I>(this: Validator<I,O>, ctx: ValidatorContext<I> & { output: I | O }): O {
    return applyResolver(
        this.is(ctx.output as I, ctx), 
        isValid => isValid ? ctx.output : ValidationError.throw(ctx, this.error)
    ) as O
}

const validate = Pipe.from(createCtx as Transform<unknown, ValidatorContext<unknown>>)
    .to(applyCtxTransform)
    .to(applyCtxValidate)

//// Main ////

abstract class Validator<I, O extends I = I> extends Validate<I, O> implements ValidatorSettings<I, O>, Copyable, Comparable {

    static from<Ix,Ox extends Ix>(settings: ValidatorSettings<Ix,Ox>, type?: string | symbol): Validator<Ix,Ox> {
        return new CustomValidator(settings, type)
    }

    transform(i: I, ctx: ValidatorContext<I>): I | O {
        ctx.transformed = i
        return i
    }

    is(i: I, ctx: ValidatorContext<I>): i is O {
        return equals(i, ctx.transformed)
    }
    
    readonly error = 'Validation failed.'

    constructor() {
        super((i, ctx) => this.validate(i, ctx))
    }

    validate = validate.bind(this) as Func as Validator<I,O>

    applySettings<S extends ValidatorSettings<I,O>>(settings: S): this {
        const Constructor = this.constructor as new (settings: ValidatorSettings<I,O>) => this
        return new Constructor({ ...settings })
    }

    [$$copy](): this {
        return this.applySettings({ ...this })
    }

    [$$equals](other: unknown): other is this {
        return other instanceof Validator &&
             other.constructor === this.constructor && 
             equals({ ...this }, { ...other })
    }
}

const $$type = Symbol('custom-validator-type-match-identifier')
interface CustomValidatorSettings<I,O extends I> extends ValidatorSettings<I,O> {
    [$$type]: symbol | string
}
class CustomValidator<I,O extends I = I> extends Validator<I, O> implements CustomValidatorSettings<I,O> {

    override get name(): string {
        return isString(this[$$type]) ? this[$$type] : this.constructor.name
    }

    [$$type]: string | symbol

    constructor(settings: ValidatorSettings<I,O>, type?: string | symbol) {
        super()
        assign(this, defined(settings))
        this[$$type] = type ?? this.constructor.name
    }

    isType(validator: Validate<I,O>): validator is this {
        return $$type in validator ? validator[$$type] === this[$$type] : false
    }
}

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorTransform,
    ValidatorTypeGuard,

    ValidatorContext,
    createCtx as createValidatorContext

}