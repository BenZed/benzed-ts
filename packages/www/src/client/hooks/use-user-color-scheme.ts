import { useCallback, useState } from 'react'

import { UserThemeMode, useThemeMode } from '@benzed/react'

import type { ColorScheme } from '@mantine/core'

//// Hooks ////

const useUserColorScheme = (userThemeMode?: UserThemeMode) => {

    // const [ colorScheme, setColorScheme ] = useThemeMode(userThemeMode)
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark')

    const toggleColorScheme = useCallback(
        (scheme?: ColorScheme) =>

            setColorScheme(
                scheme ?? (colorScheme === 'dark' ? 'light' : 'dark')
            ),

        [ setColorScheme ]
    )

    return [ colorScheme, toggleColorScheme ] as const
}

//// Helper ////

export {

    useUserColorScheme

}