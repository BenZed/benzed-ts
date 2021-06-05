import { ValidatorFactoryOutput } from '../type'

/*** Types ***/

type TrimSanitizerProps = {
    readonly trim?: boolean
}

type TrimSanitizerFactoryOutput<P extends TrimSanitizerProps> =
    ValidatorFactoryOutput<P, 'trim', true, string>

/*** Main ***/

function createTrimSanitizer<P extends TrimSanitizerProps>(
    props: P
): TrimSanitizerFactoryOutput<P> {

    if (!props.trim)
        return null as TrimSanitizerFactoryOutput<P>

    return (input => input.trim()) as TrimSanitizerFactoryOutput<P>
}

/*** Exports ***/

export default createTrimSanitizer

export {
    createTrimSanitizer,
    TrimSanitizerProps
}