//// Symbols for immutable operators ////

export const $$copy = Symbol('=')
export const $$equals = Symbol('==')

//// Symbols for internal use ////

/**
 * An extendable can only have one call signature at a time, 
 * this symbol holds the original declared method so it can 
 * be un-nested and reused in future extensions.
 */
export const $$callable = Symbol('extended-call-signature')

