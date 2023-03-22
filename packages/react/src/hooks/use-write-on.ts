import { onInterval } from '@benzed/async'
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

    useEffect(() => onInterval(() => {

        let changes = changeRate
        let newValue = value

        change: while (changes-- > 0) {
            // Match chars
            for (const index of each.indexOf(target))
                if (newValue.charAt(index) !== target.charAt(index)) {
                    const replaceOneChar = newValue.slice(0, index) + target.charAt(index) + newValue.slice(index + 1)
                    newValue = replaceOneChar
                    continue change
                }

            // Increase length
            if (newValue.length > target.length) {
                const minusOneChar = newValue.slice(0, -1)
                newValue = minusOneChar
            }

            // Reduce length
            else if (newValue.length < target.length) {
                const plusOneChar = newValue + target.slice(newValue.length, newValue.length + 1)
                newValue = plusOneChar
            }
        }

        if (newValue !== value) 
            setValue(newValue)

    }, interval), [value, target, interval, changeRate])

    return value
}

//// Exports ////

export default useWriteOn

export {
    useWriteOn,
    WriteOnOptions
}