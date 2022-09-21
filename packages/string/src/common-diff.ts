import is from '@benzed/is'
import match from '@benzed/match/lib'

/* eslint-disable @typescript-eslint/unified-signatures */

/*** Types ***/

type CommonDiff = [
    common: string,
    ...diffs: string[]
]

interface CommonDiffOptions {

    /**
     * Index where the common substring should start. Characters below this index will be discarded.
     */
    offset: number

    /**
     * Common from the end of the string, instead of the beginning
     */
    fromEnd: boolean
}

/*** Helper ***/

function getCommonChar(inputs: string[], offset: number, fromEnd: boolean): string {

    const index = fromEnd
        ? -offset - 1
        : offset

    const char = inputs[0].at(index)

    for (let i = 1; i < inputs.length; i++) {

        const input = inputs[i]
        if (input.at(index) !== char)
            return ''
    }

    return char ?? ''

}

/**
 * Given an array of strings, return a string that all strings
 * have in common.
 */
function createCommon(input: string[], offset: number, fromEnd: boolean): string {

    let common = ''
    while (input.length > 0) {

        const currentOffset = offset + common.length
        const char = getCommonChar(input, currentOffset, fromEnd)
        if (!char)
            break

        common = fromEnd
            ? char + common
            : common + char
    }

    return common
}

function* createDiffs(
    input: string[],
    offset: number,
    fromEnd: boolean
): Generator<string> {

    const start = fromEnd ? 0 : offset
    const end = fromEnd ? -offset : undefined

    for (const string of input)
        yield string.slice(start, end)

}

function getCommonDiffOptions(input: unknown): CommonDiffOptions {

    const [{ offset = 0, fromEnd = false }] = match<Partial<CommonDiffOptions>>(input)
        .break(is.number, offset => ({ offset }))
        .break(is.boolean, fromEnd => ({ fromEnd }))
        .break(is.object)
        .default({})

    return { offset, fromEnd }
}

/*** Main ***/

/**
 * Given an array of strings, return 
 */
function commonDiff(input: string[], options?: Partial<CommonDiffOptions>): CommonDiff
function commonDiff(input: string[], fromEnd?: boolean): CommonDiff
function commonDiff(input: string[], offset?: number): CommonDiff
function commonDiff(input: string[], options?: unknown): CommonDiff {

    const { offset, fromEnd } = getCommonDiffOptions(options)

    const common = createCommon(input, offset, fromEnd)

    return [
        common,
        ...createDiffs(input, common.length + offset, fromEnd)
    ]
}

/*** Exports ***/

export default commonDiff

export {
    commonDiff,
    CommonDiff,
    CommonDiffOptions
}