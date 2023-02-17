
/**
 * string, symbol or number. Values that can be a key.
 */
export type Key = PropertyKey

/**
 * Names or symbols of a given type.
 */
export type KeysOf<T> = keyof T

/**
 * Union of string properties of a given type.
 */
export type NamesOf<T> = Extract<keyof T, string>

/**
 * Union of symbolic properties of a given type
 */
export type SymbolsOf<T> = Extract<keyof T, symbol>

/**
 * Iterate through each enumerable name or symbol property key on any
 * number of objects
 */
export function keysOf<T extends object[]>(...objects: T): IterableIterator<KeysOf<T[number]>> {

}

/**
 * Iterate through each own name or symbol property key on any
 * number of objects
 */
export function ownKeysOf<T extends object[]>(...objects: T): IterableIterator<KeysOf<T[number]>> {

}

/**
 * Iterate through every key on any number of object, regardless of enumerability
 * or being prototypal.
 */
export function allKeysOf<T extends object[]>(...objects: T): IterableIterator<KeysOf<T[number]>> {

}

/**
 * Iterate through each enumerable name property key on an object.
 */
export function namesOf<T extends object[]>(...objects: T): IterableIterator<NamesOf<T[number]>> {

}

/**
 * Iterate through each own name on an object
 */
export function ownNamesOf<T extends object[]>(...objects: T): IterableIterator<NamesOf<T[number]>> {

}

/**
 * Iterate through every key on an object, regardless of enumerability
 * or being prototypal.
 */
export function allNamesOf<T extends object[]>(...objects: T): IterableIterator<NamesOf<T[number]>> {

}

/**
 * Iterate through each enumerable name or symbol property key on an object.
 */
export function symbolsOf<T extends object[]>(...objects: T): IterableIterator<SymbolsOf<T[number]>> {

}

/**
 * Iterate through each own symbol on an object
 */
export function ownSymbolsOf<T extends object[]>(...objects: T): IterableIterator<SymbolsOf<T[number]>> {

}

/**
 * Iterate through every symbol on an object, regardless of enumerability
 * or being prototypal.
 */
export function allSymbolsOf<T extends object[]>(...objects: T): IterableIterator<SymbolsOf<T[number]>> {
    
}