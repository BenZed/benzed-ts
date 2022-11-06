
//// Main ////

/**
 * Clamps a value between a min and a max.
 *
 * @param value Value to clamp.
 * @param min=0
 * @param max=1
 * @return Clamped number.
 */
function clamp(value: number, min = 0, max = 1): number {

    return value < min
        ? min
        : value > max
            ? max
            : value

}

//// Exports ////

export default clamp

export { clamp }