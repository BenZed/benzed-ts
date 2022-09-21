
import { isFunction } from '@benzed/is'
import { equals } from '@benzed/immutable'

/*** Exports ***/

export function passThrough<I>(input: I): I {
    return input
}

export function resolveOutput<I, O>(
    output: O,
    input: I,
    _default = output
): O {

    return isFunction(output)
        ? output(input)
        : _default
}

export function matchAnyInput(): boolean {
    return true
}

export function matchCheck(input: unknown, value: unknown): boolean {
    return !!resolveOutput(
        input,
        value,
        equals(input, value)
    )
}
