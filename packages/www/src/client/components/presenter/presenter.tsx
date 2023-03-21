import React, { ReactElement, useState } from 'react'

import styled from 'styled-components'

import { useSlides } from '../../hooks'
import SlideInput from './slide-input'

//// Helper ////

const PresenterCard = styled.div`
    background-color: rgba(255,255,255,0.25);
    padding: 1em;
    border-radius: 0.25em;
    border: none;
    color: inherit;
    position: relative;
`

const SlideInfo = styled.span`

    position: absolute;

    font-weight: bold;

    top: -0.95em;
    left: 0em;
    border-radius: 0.25em;
    color: rgba(255,255,255,0.25);
`

//// Presenter Component ////

interface PresenterProps {
}

const Presenter = styled((props: PresenterProps): null | ReactElement => {

    const { ...rest } = props

    const [slides, current, setCurrent] = useSlides()
    const [cardIndex, setCardIndex] = useState(0)

    const slide = slides.at(current)

    const card = slide?.cards[cardIndex] ?? null

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

    return <div {...rest}>

        {slide && <PresenterCard>
            <SlideInfo>Slide {current} Card {cardIndex + 1} of {slide?.cards.length}</SlideInfo>
            {card}
        </PresenterCard>}

        <SlideInput
            onNext={onNext}
            onPrev={onPrev}
        />

    </div>
})`

    margin: 2em 4em 2em 2em;

    position: absolute;
    bottom: 0;
    opacity: 0.8;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

`

//// Exports ////

export default Presenter

export {
    Presenter,
    PresenterProps
}