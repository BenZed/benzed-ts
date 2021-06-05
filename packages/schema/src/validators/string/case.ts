import { capitalize } from '@benzed/string'
import { ValidatorFactoryOutput } from '../type'

/*** Types ***/

type Casing = 'upper' | 'lower' | 'capitalize'
interface CaseSanitizerProps {
    readonly casing?: Casing
}

type CaseSanitizerFactoryOutput<P extends CaseSanitizerProps> =
    ValidatorFactoryOutput<P, 'casing', Casing, string>

/*** Main ***/

function createCaseSanitizer<P extends CaseSanitizerProps>(
    props: P
): CaseSanitizerFactoryOutput<P> {

    type Output = CaseSanitizerFactoryOutput<P>

    if (!props.casing)
        return null as Output

    switch (props.casing) {
        case 'lower':
            return (input => input.toLowerCase()) as Output

        case 'upper':
            return (input => input.toUpperCase()) as Output

        case 'capitalize':
            return (input => capitalize(input)) as Output

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