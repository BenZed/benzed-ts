import { Func, io } from '@benzed/util'

import { 
    AssertValidTransformValidator,
    AssertTransformValidator, 
    ErrorDefaultAndArgs, 
    ErrorSettings 
} from './validator'

//// Constants ////

const CUSTOM_VALIDATOR_DEFAULT_ERROR = 'Validation failed'

function isFunction(input: unknown): input is Func {
    return typeof input === 'function'
}

//// Type ////

interface CustomTransform<I, O extends I = I> {

    /**
     * Applies a transformation to the input to make it valid.
     */
    transform: AssertTransformValidator<I,O>['_transform']
}

interface CustomAssert<I, O extends I = I> {

    /**
     * Returns true if the input is valid, false otherwise.
     */
    isValid: ((input: I) => input is O) | ((input:I) => boolean)
}

interface CustomError<I> {
    error: Exclude<ErrorSettings<[input: I]>['error'], undefined>
}

type CustomAssertAndOrTransform<I,O extends I> = 
    CustomAssert<I,O> | 
    CustomTransform<I,O> | 
    (
        CustomAssert<I,O> & 
        CustomTransform<I,O>
    )

type CustomValidatorSettings<I, O extends I = I> = 
    CustomError<I> &
    CustomAssertAndOrTransform<I,O>

type CustomValidatorSettingsShortcut<I, O extends I = I> = 
    [
        CustomTransform<I, O>['transform']
    ] | [
        CustomTransform<I, O>['transform'], 
        CustomError<I>['error']
    ] | [
        CustomTransform<I, O>['transform'], 
        CustomAssert<I, O>['isValid'], 
        CustomError<I>['error']
    ] | [
        CustomAssertAndOrTransform<I,O>
    ] | [
        CustomValidatorSettings<I, O>
    ]

//// Helper ////

const toCustomValidatorSettings = <I, O extends I = I>(

    input: CustomValidatorSettingsShortcut<I,O>

): CustomValidatorSettings<I,O> => {
    switch (input.length) {

        case 1: {
            const [ transformOrSettings ] = input 
            return {
                error: CUSTOM_VALIDATOR_DEFAULT_ERROR,
                ...isFunction(transformOrSettings) 
                    ? { transform: transformOrSettings } 
                    : transformOrSettings
            }
        }

        case 2: {
            const [ transform, error ] = input 
            return {
                transform,
                error
            }
        }

        case 3: {
            const [ transform, isValid, error ] = input 
            return {
                transform,
                isValid,
                error
            }
        }
    }
}

//// Main ////

class CustomValidator<I, O extends I = I> 
    extends AssertValidTransformValidator<I, CustomValidatorSettings<I,O>> {

    protected override _onApplySettings(): void {

        const { settings } = this

        this._isValid = 'isValid' in settings 
            ? settings.isValid
            : super._isValid

        this._transform = 'transform' in settings 
            ? settings['transform']
            : io
    }

    protected _getErrorDefaultAndArgs(
        i: I
    ): ErrorDefaultAndArgs<CustomValidatorSettings<I, O>> {
        return [this.settings.error, i]
    }

}

interface CustomValidator<I, O extends I = I> {
    /**
     * @internal
     */
    _transform: CustomTransform<I,O>['transform']
}

//// Exports ////

export default CustomValidator

export {
    CustomValidator,
    CustomValidatorSettings,
    CustomValidatorSettingsShortcut,
    toCustomValidatorSettings,

    CustomTransform,
    CustomAssert,

    CUSTOM_VALIDATOR_DEFAULT_ERROR
}