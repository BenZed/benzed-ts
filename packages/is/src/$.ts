import type { Assert, Is, Validate } from './$-types'
import { Flags, F, Flag } from './flags'

import { chain } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

const setNameFromFlag = (m: object, flag: Flag): object => 
    Object.defineProperty(
        m, 
        'name', { 
            value: Flag[flag].toLowerCase(), 
            enumerable: true 
        })

const addTermTransition = (m: object, flags: Flags, terms: readonly Term[], term: Term): object => {
    return Object.defineProperty(m, term, {
        enumerable: true,
        get() {
            return $(flags, [...terms, term])
        }
    })
}

//// Type Terms ////

const SCHEMA_TERMS = {

    string(x: unknown) {
        return typeof x === 'string'
    },

    boolean(x: unknown) {
        return typeof x === 'boolean'
    },

    number(x: unknown) {
        return typeof x === 'number' && !Number.isNaN(x)
    },

}

const SCHEMA_FACTORY_TERMS = {

    type(type: unknown) {
        throw new Error('type(type) not yet implemented')
    },

    or(type: unknown) {

        throw new Error('or(type) not yet implemented')
        // return $(this.flags, this.terms, type)
    }
}

const TERMS = {
    ...SCHEMA_TERMS,
    ...SCHEMA_FACTORY_TERMS
}

type Term = keyof typeof SCHEMA_FACTORY_TERMS | keyof typeof SCHEMA_TERMS

//// This function is going to be a fuckin doozy ////

const $ = (flags: Flags, terms: readonly Term[], v?: unknown): unknown => {

    const term = terms.at(-1) ?? 'type'

    const f = Object.assign(TERMS[term], { flags, terms })
    
    for (const t in TERMS)
        addTermTransition(f, flags, terms, t as Term)

    return setNameFromFlag(f, flags[0])
}

//// Defaults ////

const is = $([F.Is, F.Readonly, F.Required], []) as Is
const assert = $([F.Assert, F.Readonly, F.Required], []) as Assert
const validate = $([F.Validate, F.Readonly, F.Required], []) as Validate

//// Exports ////

export { is, assert, validate }