
/* eslint-disable 
    @typescript-eslint/no-namespace, 
    @typescript-eslint/prefer-readonly-parameter-types,
    @typescript-eslint/no-explicit-any,

    @typescript-eslint/indent
*/

import is, { Constructor, isDefined, isFunction } from '@benzed/is'
import { wrap } from '@benzed/array'

import pipeValidators from '../util/pipe-validators'
import ValidationError from '../util/validation-error'

/*** Types ***/

type TypeValidationErrorFormat = string | ((value: unknown, typeName: string) => string)
class TypeValidationError<T> extends ValidationError {
    public constructor (
        value: T,
        typeName: string,
        format: TypeValidationErrorFormat =
            (value, typeName) => `${value} must be of type ${typeName}.`
    ) {
        super(format, value, typeName)
    }
}

type RequiredValueErrorFormat = string | ((key: string) => string)
class RequiredValueError extends ValidationError {
    public constructor (
        key: string,
        format: RequiredValueErrorFormat = key => `${key} is required.`
    ) {
        super(format, key)
    }
}

type IsTypePredicate<T> = ((input: unknown) => input is T)

type TypeCastMethod = ((input: unknown) => unknown)

type Validator<I, O = I> = (input: I) => O

interface TypeValidatorConfig<T> {

    /**
     * Method to attempt to cast inputs with mismatched types to the desired type.
     */
    cast?: TypeCastMethod

    /**
     * Overrides the default TypeValidationError message
     */
    error?: TypeValidationErrorFormat

    /**
     * Validators to be run on the input value, once it's correct
     * type has been ascertained.
     */
    validate?: (Validator<T> | null)[]
}

interface TypeTestValidatorConfig<T> extends TypeValidatorConfig<T> {

    /**
     * Name of the type, for error messages.
     */
    name?: string

    /**
     * Method to use to determine if the input is of a given type.
     */
    test: IsTypePredicate<T>
}

interface TypeConstructorValidatorConfig<T> extends TypeValidatorConfig<T> {

    /**
     * Type to check against.
     */
    type: Constructor<T>
}

type Primitive = symbol | string | number | boolean

type DefaultProp<T> = T extends Primitive
    ? T | (() => T)
    : () => T

interface ValidatorProps<T> {

    /**
     * Used by child validators.
     */
    key?: string | number

    /**
     * Field is required.
     */
    optional?: boolean

    /**
     * 
     */
    default?: DefaultProp<T>
    cast?: boolean | TypeCastMethod
    error?: TypeValidationErrorFormat

    /**
     * Validators to be run on the input value, once it's correct
     * type has been ascertained.
     */
    validate?:
    Validator<T> |
    Validator<T>[]

}

type TypeValidatorFactoryOutput<P extends ValidatorProps<O> | undefined, I, O = I> =
    P extends undefined
    ? null
    : P extends { optional: true }
    ? Validator<I, O | undefined>
    : Validator<I, O>

type ValidatorFactoryOutput<P, PK extends keyof P, PKV, VO> =
    P[PK] extends PKV ? Validator<VO> : null

/*** Main ***/

function createTypeValidator<P extends ValidatorProps<O>, I, O = I>(
    props: P,
    config: TypeTestValidatorConfig<O> | TypeConstructorValidatorConfig<O>
): TypeValidatorFactoryOutput<P, I, O> {

    const { cast, validate, default: _default } = props

    // Create get default
    const getDefault = _default !== undefined
        ? isFunction(_default)
            ? _default as () => O
            : () => _default
        : null

    const isType: IsTypePredicate<O> = 'type' in config
        ? (input?: unknown): input is O => is(input, config.type)
        : config.test

    const toType = cast
        ? cast === true
            ? config.cast
            : cast
        : null

    const typeName = ('type' in config ? config.type.name : config.name) ?? 'Any'

    const validators = pipeValidators(
        ...config.validate ?? [],
        ...validate ? wrap(validate) : []
    )

    return ((input?: I | O) => {

        let output = input

        if (getDefault && !isDefined(output))
            output = getDefault() as O | undefined

        if (toType && isDefined(output) && !isType(output))
            output = toType(output) as O | undefined

        if (isDefined(output) && !isType(output)) {
            throw new TypeValidationError(
                output,
                typeName,
                props.error ?? config.error
            )
        }

        if (!props.optional && !isDefined(output) && !isType(output)) {
            throw new RequiredValueError(
                'value', // TODO replace with path of value currently being validated
            )
        }

        if (isDefined(output) && config.validate)
            return validators(output as O)

        return output

    }) as TypeValidatorFactoryOutput<P, I, O>
}

/*** Exports ***/

export default createTypeValidator

export {
    createTypeValidator,
    TypeValidatorConfig,
    TypeValidatorFactoryOutput,
    Validator,
    ValidatorFactoryOutput,
    ValidatorProps,
}