import { authenticate } from '@feathersjs/authentication'

/**
 * These are shortcuts for hooks that are generally configured 
 * the same way.
 */

/*** Hooks ***/

/**
 * Authenticate jwt token.
 */
export const authenticateJwt = authenticate('jwt')