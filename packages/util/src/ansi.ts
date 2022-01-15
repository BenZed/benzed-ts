
/*** Types ***/

type AnsiColor = keyof typeof ANSI_COLOR_CODES

type AnsiOptions = {
    color?: AnsiColor
    bright?: boolean
    bold?: boolean
    background?: boolean
    inverted?: boolean
    underline?: boolean
}

/*** Constants ***/

const ANSI_COLOR_CODES = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37
} as const

const ANSI_BACKGROUND_DELTA = 10

const ANSI_BRIGHT_SUFFIX = ';1'

const ANSI_UTIL_TAGS = {

    bold: '\u001b[1m',
    underline: '\u001b[4m',
    reset: '\u001b[0m',
    inverted: '\u001b[7m'

} as const

/*** Helper ***/

const ansiColorTag = (
    color: AnsiColor,
    bright?: boolean,
    background?: boolean
): `\u001b[${number}${typeof ANSI_BRIGHT_SUFFIX | ''}m` => {

    const code = ANSI_COLOR_CODES[color]

    const delta = background ? ANSI_BACKGROUND_DELTA : 0

    const suffix = bright ? ANSI_BRIGHT_SUFFIX : ''

    return `\u001b[${code + delta}${suffix}m`
}

/*** Main ***/

// TODO much better syntax: 
// ansi.bright.bold.red.underline`This rocks!`

/**
 * Decorate a string with ANSI escape sequences.
 */
function ansi(
    input: { toString(): string },
    options: AnsiColor | AnsiOptions
): string {

    // Get Options
    const {

        color,
        bright,
        bold,
        underline,
        inverted,
        background

    } = typeof options === 'string' ? { color: options } as AnsiOptions : options

    // Compile Output
    const tags: string[] = []

    if (bold)
        tags.push(ANSI_UTIL_TAGS.bold)

    if (underline)
        tags.push(ANSI_UTIL_TAGS.underline)

    if (inverted)
        tags.push(ANSI_UTIL_TAGS.inverted)

    if (color)
        tags.push(ansiColorTag(color, bright, background))

    // No tags? Return input as is.
    if (tags.length === 0)
        return input.toString()

    return `${tags.join('')}${input}${ANSI_UTIL_TAGS.reset}`
}

/*** Exports ***/

export default ansi

export {
    ansi,
    ansiColorTag,

    AnsiColor,
    AnsiOptions
}