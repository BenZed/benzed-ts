import { onInterval } from '@benzed/async'
import { each } from '@benzed/util'

import { useEffect, useState } from 'react'

//// Main ////

const useWriteOn = (target: string, interval = 50) => {

    const [value, setValue] = useState(target)

    useEffect(() => onInterval(() => {

        // Match chars
        for (const index of each.indexOf(target))
            if (value.charAt(index) !== target.charAt(index)) {
                const replacedChar = value.slice(0, index) + target.charAt(index) + value.slice(index + 1)
                setValue(replacedChar)
                return
            }

        // Increase length
        if (value.length > target.length) {
            const minusOneChar = value.slice(0, -1)
            setValue(minusOneChar)
        }

        // Reduce length
        else if (value.length < target.length) {
            const plusOneChar = value + target.slice(value.length, value.length + 1)
            setValue(plusOneChar)
        }

    }, interval), [value, target, interval])

    return value
}

//// Exports ////

export default useWriteOn

export {
    useWriteOn
}