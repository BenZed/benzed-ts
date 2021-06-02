import { Validator } from '../validators/type'

/**
 * Returns a validator that runs all given validators in order, feeding the output of
 * the current into the next.
 * @param validators Validators to combine
 * @returns 
 */
export default function pipeValidators<T>(
    ...validators: readonly (Validator<T, T> | null)[]
): Validator<T, T> {

    const _validators = validators.filter(v => v) as Validator<T, T>[]

    return (input: T): T => {
        for (const validator of _validators)
            input = validator(input)

        return input
    }

}