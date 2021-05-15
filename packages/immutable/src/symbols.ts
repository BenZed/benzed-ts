
/*** Symbols for pseudo javascript valuetype operators ***/

const $$copy = Symbol('=')
const $$equals = Symbol('==')

/*** Symbols for internal use ***/

const $$circular = Symbol('circular-reference')
const $$excluded = Symbol('value-should-not-be-included-in-copy')

/*** Exports ***/

export {
    $$copy,
    $$equals,
    $$excluded,
    $$circular
}
