import { toDashCase } from '@benzed/string'

/*** Main ***/

/**
 * Converts a string into a pretty url friendly endpoint.
 * @param input 
 * @returns 
 */
function toEndPoint(input: string | number): string {
    return toDashCase(input.toString())
}

/*** Exports ***/

export default toEndPoint

export {
    toEndPoint
}