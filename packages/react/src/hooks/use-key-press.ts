import { useEffect } from 'react'

import { each } from '@benzed/util'

//// Types ////

export type KeyPressListener = (e: KeyboardEvent) => void

//// Main ////

export const useKeyPress = (keyActionMap: Record<string, KeyPressListener>) => {
    useEffect(() => {

        const eventListeners: KeyPressListener[] = each
            .entryOf(keyActionMap)
            .map(([key, action]) =>
                (e: KeyboardEvent) =>
                    e.key === key && action(e)
            )

        for (const eventListener of eventListeners)
            window.addEventListener('keydown', eventListener)

        return () => {
            for (const eventListener of eventListeners)
                window.removeEventListener('keydown', eventListener)
        }
    })
}