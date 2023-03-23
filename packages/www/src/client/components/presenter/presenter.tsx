import { useWriteOn } from '@benzed/react'
import React, { ReactElement, useState } from 'react'

import styled from 'styled-components'
import { Slide } from '../../../app/presentation'
import { ACCENT_COLOR } from '../global-style'

import SlideInput from './slide-input'

//// Helper Components ////

const PresenterCard = styled.div`
    padding: 1em;

    color: inherit;
    position: relative;
    font-family: monospace;
    font-size: 120%;

    width: 40em;
    min-height: 5em;
`

const SlideInfo = styled.div`

    display: flex;
    align-items: between;

    font-weight: bold;

    span:first-child {
        margin-right: auto;
    }

    margin-bottom: 1em;

`

//// Main Component ////

interface PresenterProps {
    slides: Slide[]
    current: number,
    setCurrent: (current: number) => void | Promise<void>
}

const Presenter = styled((props: PresenterProps): null | ReactElement => {

    const { slides, current, setCurrent, ...rest } = props

    const [cardIndex, setCardIndex] = useState(0)

    const slide = slides.at(current)

    const cardContent = slide?.cards[cardIndex] ?? ''

    const cardTitle = cardIndex === 0
        ? <h3>{slide?.title}</h3>
        : null

    const onNext = () => {
        if (cardIndex + 1 >= (slide?.cards.length ?? 0)) {
            setCardIndex(0)
            setCurrent(current + 1)

        } else
            setCardIndex(cardIndex + 1)
    }

    const onPrev = () => {
        if (cardIndex - 1 < 0 && current > 0) {
            setCurrent(current - 1)
            const nextSlide = slides.at(current - 1)
            const nextCardIndex = nextSlide ? nextSlide.cards.length - 1 : 0
            setCardIndex(nextCardIndex)

        } else if (cardIndex - 1 >= 0)
            setCardIndex(cardIndex - 1)
    }

    const numCards = slide?.cards.length ?? 0

    return <div {...rest}>
        <SlideInput
            onNext={onNext}
            onPrev={onPrev}
        >
            {slide && <PresenterCard>
                <SlideInfo>
                    <span>Slide {Math.min(current + 1, slides.length)} of {slides.length} </span>
                    <span>Card {Math.min(cardIndex + 1, numCards)} of {numCards}</span>
                </SlideInfo>
                {cardTitle}
                {cardContent}
            </PresenterCard>}
        </SlideInput>

    </div>
})`

    display: flex;
    justify-content: center;

    font-size: 125%;
    width: 100%;
    background-color: ${ACCENT_COLOR};

`

//// Exports ////

export default Presenter

export {
    Presenter,
    PresenterProps
}