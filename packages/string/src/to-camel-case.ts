import { Split, ToString } from './types'

//// Types ////

/**
* `any_delimited-string type` -> `anyDelimiteStringType`
* ['or','a','string','type','array] -> `orAStringTypeArray`
*/
type ToCamelCase<S extends string | string[] | readonly string[], D extends string> = 
    string extends S ? string : // ignore untyped strings
        S extends string ? ToCamelCase<Split<S, D>, D> : 
            S extends [infer Sx, ...infer Sr]
                ? Sr extends string[] | readonly string[]

                    // ensure ['', 'up'] does not result in 'Up'
                    ? ToString<Sx> extends '' 
                        ? ToCamelCase<Sr, D>
                        : `${ToString<Sx>}${Capitalize<ToCamelCase<Sr, D>>}`

                    : ToString<Sx>
                : ToString<S>

//// Type Safe Signatures ////

function toCamelCase(input: string, delimeter: RegExp): string

function toCamelCase<S extends string>(input: S): ToCamelCase<S, ' ' | '-' | '_'>

function toCamelCase<S extends string, D extends string>(input: S, delimeter: D): ToCamelCase<S, D>

//// Implementation ////

/**
 * Converts a string to camelCase.
 * 
 * ```typescript
 * toCamelCase('whats-up-man') // whatsUpMan
 * ```
 *
 * @param  input Input.
 * @param  delimiter=/-/ Delimiter.
 * @return camelCased string.
 */
function toCamelCase(
    input: string, 
    delimiter: string | RegExp = / |-|_/
): string {

    let camelCased = ''
    let capitalizeNext = false

    if (typeof delimiter === 'string')
        delimiter = new RegExp(delimiter)

    for (let i = 0; i < input.length; i++) {

        const char = input.charAt(i)

        if (delimiter.test(char))
            capitalizeNext = true

        else if (capitalizeNext) {
            camelCased += char.toUpperCase()
            capitalizeNext = false

        } else
            camelCased += char
    }

    return camelCased
}

//// Exports ////

export default toCamelCase

export {
    toCamelCase,
    ToCamelCase
}