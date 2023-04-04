import { useState, useEffect, Dispatch } from 'react'

import { IS_NODE } from '@benzed/util'

/*** Data ***/

const darkModeMatchMedia: MediaQueryList | null = IS_NODE
    ? null
    : window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null

//// Types ////

const THEME_MODES = ['dark', 'light'] as const
type ThemeMode = typeof THEME_MODES[number]

const USER_THEME_MODES = [...THEME_MODES, 'auto'] as const
type UserThemeMode = typeof USER_THEME_MODES[number]

//// UseThemeMode ////

const useThemeMode = (
    userThemeMode: UserThemeMode = 'auto'
): [
    themeMode: ThemeMode, 
    setThemeMode: Dispatch<ThemeMode>, 
    canAutomate: boolean
] => {

    //// State ////
    
    const [ themeMode, setThemeMode ] = useState<ThemeMode>(
        darkModeMatchMedia?.matches
            ? 'dark'
            : 'light'
    )

    //// Effect ////

    useEffect(() => {

        const isAuto = userThemeMode === 'auto'
        if (!isAuto && themeMode !== userThemeMode)
            setThemeMode(userThemeMode)

        if (!isAuto || !darkModeMatchMedia)
            return

        const applyThemeMode = (media: MediaQueryListEvent | MediaQueryList) => {
            const autoMode = media.matches ? 'dark' : 'light'
            if (autoMode !== themeMode)
                setThemeMode(autoMode)
        }

        applyThemeMode(darkModeMatchMedia)

        darkModeMatchMedia.addEventListener('change', applyThemeMode)
        return () => {
            darkModeMatchMedia.removeEventListener('change', applyThemeMode)
        }
    }, [userThemeMode, themeMode, setThemeMode])

    //// Exposed ////
    
    const canAutomate = !!darkModeMatchMedia
    return [ themeMode, setThemeMode, canAutomate ]
}

//// Exports ////

export default useThemeMode

export {
    useThemeMode,

    THEME_MODES,
    USER_THEME_MODES,

    ThemeMode,
    UserThemeMode
}