import {

    E, LN2, LN10, LOG2E, LOG10E, PI, SQRT1_2, SQRT2

} from './constants'

import {

    abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos,
    cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min,
    pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc

} from './overrides'

import lerp from './lerp'
import clamp from './clamp'
import toFraction from './to-fraction'

import { primes, isPrime } from './prime'

/*** Exports ***/

/**
 * Q: Why all the re-exports?
 * A: So I don't have to mix: 
 * ```typescript 
 * import { floor } from '@benzed/math'
 * const { PI } = Math
 * ```
 * 
 * And instead:
 * ```typescript
 * import { floor, PI } from '@benzed/math'
 * ```
 */

export {

    E, LN2, LN10, LOG2E, LOG10E, PI, SQRT1_2, SQRT2,

    abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos,
    cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2,
    pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc,

    max, min,

    lerp, clamp, isPrime, primes,

    toFraction

}
