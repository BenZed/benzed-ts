import { MantineThemeOverride } from '@mantine/core'
import { libby } from './assets'

//// Exports ////

export const theme: MantineThemeOverride = {
    globalStyles: t => ({

        '@font-face': [
            {
                fontFamily: 'Libby',
                src: `url('${libby.heavy}') format('woff2')`,
                fontStyle: 'bold',
            }, 
            {
                fontFamily: 'Libby',
                src: `url('${libby.bold}') format('woff2')`,
                fontStyle: 'normal',
            }
        ],

        body: {
            background: t.fn.linearGradient(
                177, 
                t.colorScheme === 'light' ? t.white : t.colors.dark[8],
                t.colorScheme === 'light' ? t.colors.gray[3] : t.colors.dark[8],
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
    }
}