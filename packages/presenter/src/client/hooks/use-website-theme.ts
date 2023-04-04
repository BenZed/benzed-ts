import type { MantineThemeOverride, ColorScheme } from '@mantine/core'

import assets from '../assets'

//// Main ////

const useWebsiteTheme = (colorScheme: ColorScheme): MantineThemeOverride => { 

    return {
        globalStyles: t => ({

            '@font-face': [
                {
                    fontFamily: 'Libby',
                    src: `url('${assets['libby-bold']}') format('woff2')`,
                    fontStyle: 'bold',
                }, 
                {
                    fontFamily: 'Libby',
                    src: `url('${assets['libby-regular']}') format('woff2')`,
                    fontStyle: 'normal',
                }
            ],

            body: {
                width: '100vw',
                height: '100vh',
                boxSizing: 'border-box',
                background: t.fn.linearGradient(
                    177, 
                    t.colorScheme === 'light' ? t.white : t.colors.dark[6],
                    t.colorScheme === 'light' ? t.colors.gray[3] : t.colors.dark[9],
                )
            }
        }),

        colors: {
            orange: [
                '#fff2dd',
                '#fadab5',
                '#f3c48a',
                '#eeac5e',
                '#e79431',
                '#ce7b18',
                '#a06010',
                '#734409',
                '#472802',
                '#1d0c00'
            ],
        },
        primaryColor: 'orange',
        primaryShade: {
            dark: 3,
            light: 8
        },
        colorScheme
    }

}

//// Exports ////

export {
    useWebsiteTheme
}