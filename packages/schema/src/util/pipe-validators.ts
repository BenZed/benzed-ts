import { Validator } from '../validators/type'

/**
 * Returns a validator that runs all given validators in order, feeding the output of
 * the current into the next.
 * @param validators Validators to combine
 * @returns 
 */
export default function pipeValidators<I, O = I>(
    ...validators: readonly (Validator<I, O> | null)[]
): Validator<I, O> {

    const _validators = validators.filter(v => v) as Validator<I, O>[]

    return (input: T): T => {
        for (const validator of _validators)
            input = validator(input)

        return input
    }

}