import { Func } from './types'

//// Property Helpers ////

/**
 * Set the name of an object.
 */
export const defineName = <T extends object | Func>(obj: T, name: string): T =>
    Object.defineProperty(obj, 'name', { value: name }) 