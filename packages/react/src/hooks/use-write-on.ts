import { onTimeout } from '@benzed/async'
import { each } from '@benzed/util'

import { useEffect, useState } from 'react'

//// Types ////

interface WriteOnOptions {

    /*
     * Milliseconds between write update
     */
    readonly interval?: number

    /**
     * Number of characters changed per update. 
     */
    readonly changeRate?: number

    /**
     * Defaults to the target value
     */
    readonly initialValue?: string
}

//// Main ////

const useWriteOn = (target: string, options: WriteOnOptions = {}) => {

    const {
        changeRate = 1,
        initialValue = target,
        interval = 50 
    } = options

    const [ value, setValue ] = useState(initialValue)

    const [ reverse, setReverse ] = useState(target.length > value.length)

    useEffect(() => {
        setReverse(target.length < value.length)
    }, [target])

    useEffect(() => onTimeout(() => {

        let changes = changeRate
        let newValue = value

        change: while (changes-- > 0) {

            // Increase length
            if (newValue.length > target.length) {
                const minusOneChar = newValue.slice(0, -1)
                newValue = minusOneChar
                continue change
            }

            // Match characters
            for (const i of each.indexOf(newValue, { reverse })) {
                if (newValue.charAt(i) !== target.charAt(i)) {
                    const replaceOneChar = newValue.slice(0, i) + target.charAt(i) + newValue.slice(i + 1)
                    newValue = replaceOneChar
                    continue change
                }
            }

            // Reduce length
            if (newValue.length < target.length) {
                const plusOneChar = newValue + target.slice(newValue.length, newValue.length + 1)
                newValue = plusOneChar
                continue change
            }

            changes = 0 // if we've gotten here newValue must equal target
        }

        if (newValue !== value) 
            setValue(newValue)

    }, interval), [value, target, reverse, interval, changeRate])

    return value
}

//// Exports ////

export default useWriteOn

export {
    useWriteOn,
    WriteOnOptions
}