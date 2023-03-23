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

    width: 40em;
    height: 5em;
`

const SlideInfo = styled.div`

    position: absolute;
    display: flex;
    align-items: between;

    font-weight: bold;

    span:first-child {
        margin-right: auto;
    }

    bottom: 0em;
    left: 0.25em;
    right: 0.25em;
    border-radius: 0.25em;
    color: rgba(255,255,255,0.25);
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

    const cardContent = useWriteOn(
        slide?.cards[cardIndex] ?? '',
        {
            interval: 50,
            changeRate: 11
        }
    )

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
                    <span>Slide {current}</span>
                    <span>Card {Math.min(cardIndex + 1, numCards)} of {numCards}</span>
                </SlideInfo>
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