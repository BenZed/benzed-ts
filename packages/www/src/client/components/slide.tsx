import React, { ReactElement, useEffect, useState } from 'react'

import { GenericObject } from '@benzed/util'
import { onTimeout } from '@benzed/async'

import styled from 'styled-components'

import { ACCENT_COLOR } from './global-style'

import Markdown from './markdown'

import type { Slide as SlideJson, PresentationState, ContentCard, Slide } from '../../app/presentation'

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

const useContentFromAllCardsUpToCurrent = (slide: Slide, current: PresentationState): string => {

    const isUsedCard = (_: ContentCard, i: number) => i < current.card

    const content = slide
        .cards
        .filter(isUsedCard)
        .map(card => card.content)
        .join('')

    return content
}

//// Slide Component ////

interface SlideProps {
    slide: SlideJson
    current: PresentationState
}

const Slide = styled((props: SlideProps): ReactElement => {

    const { slide, current, ...rest } = props

    const content = useContentFromAllCardsUpToCurrent(slide, current)

    return <section {...rest}>
        <Markdown content={content} />
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