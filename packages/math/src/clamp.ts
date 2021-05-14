
/*** Main ***/

/**
 * Clamps a value between a min and a max.
 *
 * @param  {number} value Value to clamp.
 * @param  {number} min=0
 * @param  {number} max=1
 * @return {number}       Clamped number.
 */
function clamp(value: number, min = 0, max = 1): number {

    return value < min
        ? min
        : value > max
            ? max
            : value

}

/*** Exports ***/

export default clamp
