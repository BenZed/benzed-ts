import React, { ReactElement, useEffect, useState } from 'react'

import { GenericObject } from '@benzed/util'
import { onTimeout } from '@benzed/async'

import styled from 'styled-components'

import { ACCENT_COLOR } from './global-style'
import Markdown from './markdown'
import type { Slide as SlideJson } from '../../app/presentation'

//// Constants ////

const DEFAULT_TRANSLATION_TIME = 250

//// Hook ////

const useTranslateAnimation = (time: number) => {

    const [style, setTranslate] = useState<GenericObject>({ transform: `translateX(-200%)` })

    useEffect(
        () => onTimeout(() => setTranslate({ transform: undefined }), time),
        []
    )

    return style
}

const Translate = styled((props: { children: ReactElement, time?: number }) => {

    const { time = DEFAULT_TRANSLATION_TIME, children, ...rest } = props

    const style = useTranslateAnimation(time)

    return <div {...rest} style={style} >{children}</div>
})`
    align-self: center;
    display: flex;
    flex-direction: column;

    transition: transform ${p => p.time ?? DEFAULT_TRANSLATION_TIME}ms;

    pre {
        padding: 0em 2em 0em 2em;
    }

`

//// Slide Component ////

interface SlideProps {
    slide: SlideJson
}

const Slide = styled((props: SlideProps): ReactElement => {

    const { slide, ...rest } = props

    return <section {...rest}>
        <Translate key={slide.content}>
            <Markdown content={slide.content} />
        </Translate>
    </section>
})`
    display: flex;
    flex-direction: column;

    a {
        color: inherit;
    }

    a:visited {
        color: ${ACCENT_COLOR};
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