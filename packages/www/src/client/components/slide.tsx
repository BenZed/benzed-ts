import React, { ReactElement } from 'react'
import { useSlides } from '../hooks'

import styled from 'styled-components'
import Markdown from './markdown'
import type { Slide as SlideJson } from '../../app/presentation'
import { ACCENT_COLOR } from './global-style'

//// Slide Component ////

interface SlideProps {
    slide: SlideJson
}

const Slide = styled((props: SlideProps): ReactElement => {

    const { slide, ...rest } = props

    return <section {...rest}>
        <div>
            <Markdown content={slide.content} />
        </div>
    </section>
})`
    display: flex;
    flex-direction: column;

    div {
        align-self: center;
        display: flex;
        flex-direction: column;
    }

    div pre {
        padding: 0em 2em 0em 2em;
    }

    box-sizing: border-box;
    width: 100vw;

    padding: 2em;

    overflow-y: auto;

    ::-webkit-scrollbar {
        width: 0.5em;
    }

    ::-webkit-scrollbar-thumb {
        background-color: ${ACCENT_COLOR};
    }
`

//// Exports ////

export default Slide

export {
    Slide,
    SlideProps
}