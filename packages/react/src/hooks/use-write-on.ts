import { onInterval } from '@benzed/async'
import { each } from '@benzed/util'
import is from '@benzed/is'

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

        const isEven = is.number.even()

        change: while (changes-- > 0) {

            const onAlternatingSides = { reverse: isEven(changes) }

            // Match chars
            for (const i of each.indexOf(target, onAlternatingSides))
                if (newValue.charAt(i) !== target.charAt(i)) {
                    const replaceOneChar = newValue.slice(0, i) + target.charAt(i) + newValue.slice(i + 1)
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