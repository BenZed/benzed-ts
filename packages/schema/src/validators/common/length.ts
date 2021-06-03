import createRangeValidator, {
    toRangeConfig,
    RangeValidatorProps,
    RangeConfig
} from '../number/range'

import { Validator } from '../type'

/*** Types ***/

interface LengthValidatorProps {
    length?: RangeValidatorProps['range']
}

/*** Helper ***/

function toLengthConfig(
    input: NonNullable<RangeValidatorProps['range']>
): RangeConfig {

    const lengthOptions = {
        ...toRangeConfig(input)
    }

    // Override default error
    lengthOptions.error = lengthOptions.error ??
        ((_input, rangeTransgressionDetail) => `length must be ${rangeTransgressionDetail}`)

    return lengthOptions
}

/*** Main ***/

function createLengthValidator<T extends { length: number }>(
    props: Readonly<LengthValidatorProps>
): Validator<T> | null {

    if (!props.length)
        return null

    const lengthConfig = toLengthConfig(props.length)

    const rangeValidator = createRangeValidator({ range: lengthConfig }) as Validator<number>

    return input => {
        rangeValidator(input.length)
        return input
    }
}

/*** Exports ***/

export default createLengthValidator

export {
    LengthValidatorProps
}