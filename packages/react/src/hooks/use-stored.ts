import {
    useEffect,
    useMemo,
    useState,

    Dispatch,
    useCallback,
} from 'react'

import {
    IS_BROWSER,
    IS_DEV
} from '@benzed/util'

import { onInterval } from '@benzed/async'

//// Constants ////

const LOCAL_STORAGE_CHECK_POLL_INTERVAL = 250 // ms

//// Module State ////

const MEMORY_STORAGE: Record<string, string> = {}

//// Helper ////

function getStoredString<S extends string>(key: string, defaultString: S): S {
    const useMemory = !IS_BROWSER || !key

    return ((useMemory
        ? MEMORY_STORAGE[key]
        : window.localStorage.getItem(key)) ?? defaultString) as S
}

function setStoredString(key: string, value: string | null): void {

    const useMemory = !IS_BROWSER || !key

    if (useMemory && value) 
        MEMORY_STORAGE[key] = value
    else if (useMemory && !value)
        delete MEMORY_STORAGE[key]

    else if (value)
        window.localStorage.setItem(key, value)
    else
        window.localStorage.removeItem(key)
}

function toString<T>(value: T): string {
    try {
        const serializedValue = JSON.stringify(value)
        return serializedValue
    } catch (err) {

        if (IS_DEV)
            console.error('Error serializing value:', err)

        return ''
    }
}

function toJson<T>(serializedValue: string | null): T | null {

    try {
        const value = typeof serializedValue === 'string'
            ? JSON.parse(serializedValue)
            : null

        return value
    } catch (err) {

        if (IS_DEV)
            console.error('Error deserializing value:', err)

        return null
    }
}

//// Hooks ////

function useStoredString<S extends string = string>(
    key: string,
    initialString: S
): [
        S,
        (newState: S) => void
    ] {

    const storedString = getStoredString<S>(key, initialString)

    // Q: Okay, what? Why are we introducing a timestamp, here?
    // A: We can't use a state variable 
    const setTimeStamp = useState(Date.now())[1]

    const setStoredStringAndDispatch = useCallback((newString: S | null) => {
        if (newString !== storedString) {
            setStoredString(key, newString)
            setTimeStamp(Date.now())
        }
    }, [key, setTimeStamp, storedString])

    // For updates to local storage made in other windows/contexts,
    // we use the 'storage' event.
    // For updates to local storage made in this context, we use polling.
    useEffect(() => {

        const dispatchHandler = () =>
            setStoredStringAndDispatch(getStoredString(key, initialString))

        const abortInterval = onInterval(dispatchHandler, LOCAL_STORAGE_CHECK_POLL_INTERVAL)
        window.addEventListener('storage', dispatchHandler)

        return () => {
            abortInterval()
            window.removeEventListener('storage', dispatchHandler)
        }
    }, [key, initialString, setStoredStringAndDispatch])

    return [storedString, setStoredStringAndDispatch]
}

function useStoredJson<T>(key: string, defaultState: T): [
    T,
    Dispatch<T>
] {

    const [
        storedString,
        setStoredString
    ] = useStoredString(key, toString(defaultState))

    const storedState = useMemo<T | null>(
        () => toJson(storedString),
        [storedString]
    )

    const setStoredJson = useCallback(
        (newState: T | null) => setStoredString(toString(newState)),
        [setStoredString]
    )

    return [
        storedState ?? defaultState,
        setStoredJson,
    ]
}

//// Exports ////

export default useStoredJson

export {
    useStoredJson,
    useStoredString
}