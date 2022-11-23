//// Symbols for pseudo javascript valuetype operators ////

export const $$copy = Symbol('=')
export const $$equals = Symbol('==')

//// Symbols for internal use ////

export const $$circular = Symbol('circular-reference')
export const $$excluded = Symbol('value-should-not-be-included-in-copy')
