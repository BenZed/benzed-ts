import createRangeValidator, {
    toRangeConfig,
    RangeValidatorProps,
    RangeConfig
} from './range'

import { Validator } from '../type'

/*** Types ***/

interface ClampSanitizerProps {
    clamp?: RangeValidatorProps['range']
}

/*** Helper ***/

function toClampConfig(
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

function createClampSanitizer<T extends { length: number }>(
    props: Readonly<ClampSanitizerProps>
): Validator<T> | null {

    if (!props.clamp)
        return null

    const lengthConfig = toClampConfig(props.clamp)

    const rangeValidator = createRangeValidator({ range: lengthConfig })

    return input => {
        rangeValidator(input.length)
        return input
    }
}

/*** Exports ***/

export default createClampSanitizer

export {
    ClampSanitizerProps
}