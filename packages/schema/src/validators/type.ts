
/* eslint-disable 
    @typescript-eslint/no-namespace, 
    @typescript-eslint/prefer-readonly-parameter-types,
    @typescript-eslint/no-explicit-any,

    @typescript-eslint/indent
*/

import is, { Constructor, isDefined, isFunction } from '@benzed/is'
import pipeValidators from '../util/pipe-validators'
import ValidationError from '../util/validation-error'

/*** Types ***/

type TypeValidationErrorFormat = string | ((value: unknown, typeName: string) => string)
class TypeValidationError<T> extends ValidationError {
    public constructor(
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
    public constructor(
        key: string,
        format: RequiredValueErrorFormat = key => `${key} is required.`
    ) {
        super(format, key)
    }
}

type IsTypePredicate<T> = ((input: unknown) => input is T)

type TypeCastMethod<T> = ((input: unknown) => unknown | T)

type Validator<Input, Output = Input> = (input: Input) => Output

interface TypeValidatorConfig<T> {

    /**
     * Method to attempt to cast inputs with mismatched types to the desired type.
     */
    cast?: TypeCastMethod<T>

    /**
     * Overrides the default TypeValidationError message
     */
    error?: TypeValidationErrorFormat

    /**
     * Validators to be run on the input value, once it's correct
     * type has been ascertained.
     */
    validators?: (Validator<T, T> | null)[]
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

type Immutable = symbol | string | number | boolean

type Known<T> = Exclude<T, unknown>

type DefaultProp<T> = T extends Immutable
    ? Known<T> | (() => Known<T>)
    : () => Known<T>

interface ValidatorProps<T> {
    key?: string | number

    required?: boolean | RequiredValueErrorFormat
    default?: DefaultProp<T>
    cast?: boolean | TypeCastMethod<T>
    error?: TypeValidationErrorFormat

}

type TypeValidatorFactoryOutput<T, P extends ValidatorProps<T> | undefined> =
    P extends undefined
    ? null
    : P extends { required: true | TypeValidationErrorFormat } | { default: DefaultProp<T> }
    ? Validator<T | unknown, T>
    : Validator<T | unknown, T | undefined>

// interface ReferenceValidatorProps<T extends object> extends ValidatorProps<T> {
//     default?: () => T
// }

/*** Main ***/

function createTypeValidator<T, P extends ValidatorProps<T>>(
    props: P,
    config: TypeTestValidatorConfig<T> | TypeConstructorValidatorConfig<T>
): TypeValidatorFactoryOutput<T, P> {

    const { cast, default: _default } = props

    // Create get default
    const getDefault = _default !== undefined
        ? isFunction(_default)
            ? _default as () => T
            : () => _default
        : null

    const isType: IsTypePredicate<T> = 'type' in config
        ? (input?: unknown): input is T => is(input, config.type)
        : config.test

    const toType = cast
        ? cast === true
            ? config.cast
            : cast
        : null

    const typeName = ('type' in config ? config.type.name : config.name) ?? 'Any'

    const esotericValidators = pipeValidators(...config.validators ?? [])

    return (input => {

        if (getDefault && !isDefined(input))
            input = getDefault() as T | undefined

        if (toType && isDefined(input) && !isType(input))
            input = toType(input) as T | undefined

        if (isDefined(input) && !isType(input)) {
            throw new TypeValidationError(
                input,
                typeName,
                props.error ?? config.error
            )
        }

        if (props.required && !isDefined(input) && !isType(input)) {
            throw new RequiredValueError(
                'value', // TODO replace with path of value currently being validated
                isFunction(props.required) ? props.required : undefined
            )
        }

        if (isDefined(input) && config.validators)
            return esotericValidators(input)

        return input

    }) as TypeValidatorFactoryOutput<T, P>
}

/*** Exports ***/

export default createTypeValidator

export {
    createTypeValidator,
    TypeValidatorConfig,
    TypeValidatorFactoryOutput,
    Validator,
    ValidatorProps,
}