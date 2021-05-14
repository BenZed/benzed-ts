
/*** Shortcuts ***/

/**
 * Q: Why?
 * A: So I don't have to mix: 
 * ```typescript 
 * const { PI } = Math
 * ```
 * and 
 * ```typescript
 * import { floor } from '@benzed/math'
 * ```
 * 
 * And instead:
 * ```typescript
 * import { floor, PI } from '@benzed./math'
 * ```
 */

const { E, LN2, LN10, LOG2E, LOG10E, PI, SQRT1_2, SQRT2 } = Math

/*** Exports ***/

export { E, LN2, LN10, LOG2E, LOG10E, PI, SQRT1_2, SQRT2 }
