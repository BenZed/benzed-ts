import { createGlobalStyle } from 'styled-components'

//// GlobalStyle Component ////

export const BG_COLOR = '#272727'

export const FG_COLOR = '#e1e1e1'

export const ACCENT_COLOR = '#a14523'

export const GlobalStyle = createGlobalStyle`

    html {
        font-family: Helvetica;
        background: ${BG_COLOR};
        color: ${FG_COLOR};
    }

    #benzed-www {

        display: flex;

        flex-direction: column;
        box-sizing: border-box;

        align-items: center;
        height: 100vh;
    }

    @media screen and (max-width: 600px) {
        html {
            font-size: 0.5rem;
        }
    }

    @media screen and (min-width: 601px) and (max-width: 900px) {
        html {
            font-size: 0.75rem;
        }
    }
`