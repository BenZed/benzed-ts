
/*** Main ***/

/**
 * Linearly interpolate a number to a target according to a delta.
 *
 * @param  {number} from
 * @param  {number} to
 * @param  {number} factor Factor by which to interpolate
 * @return {number} Inerpolated value.
 */
function lerp(from: number, to: number, factor: number): number {
  return from + factor * (to - from)
}

/*** Exports ***/

export default lerp
