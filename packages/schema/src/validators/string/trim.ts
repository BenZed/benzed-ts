import { isString } from '../../../../is/src'
import { Validator } from '../type'

/*** Types ***/

type TrimSanitizerProps = {
    readonly trim?: boolean
}

/*** Main ***/

function createTrimSanitizer(props: Readonly<TrimSanitizerProps>): Validator<string> | null {
    if (!props.trim)
        return null

    return input => isString(input)
        ? input.trim()
        : input
}

/*** Exports ***/

export default createTrimSanitizer

export {
    createTrimSanitizer,
    TrimSanitizerProps
}