import { capitalize } from '@benzed/string'

import { Validator } from '../type'

/*** Types ***/

interface CaseSanitizerProps {
    readonly casing?: 'upper' | 'lower' | 'capitalize'
}

/*** Main ***/

function createCaseSanitizer(props: Readonly<CaseSanitizerProps>): Validator<string> | null {

    if (!props.casing)
        return null

    switch (props.casing) {
        case 'lower':
            return input => input.toLowerCase()

        case 'upper':
            return input => input.toUpperCase()

        case 'capitalize':
            return input => capitalize(input)

        default: {
            const badCaseArg: never = props.casing
            throw new Error(`${badCaseArg} is not a valid case argument.`)
        }
    }
}

/*** Exports ***/

export default createCaseSanitizer

export {
    CaseSanitizerProps
}