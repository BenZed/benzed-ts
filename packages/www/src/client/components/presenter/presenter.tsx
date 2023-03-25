import { useWriteOn } from '@benzed/react'
import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { Slide, PresentationState } from '../../../app/presentation'
import { ACCENT_COLOR } from '../global-style'

import SlideInput from './slide-input'

//// Helper Components ////

const PresenterPrompt = styled.div`
    padding: 1em;

    color: inherit;
    position: relative;
    font-family: monospace;
    font-size: 120%;

    width: 40em;
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
    current: PresentationState,
    setCurrent: (current: PresentationState) => void | Promise<void>
}

const Presenter = styled((props: PresenterProps): null | ReactElement => {

    const { slides, current, setCurrent, ...rest } = props

    const slide = slides.at(current.slide)

    const prompt = slide?.cards.at(current.card)?.prompt ?? ''

    const writeOnPrompt = useWriteOn(prompt, { changeRate: 15, interval: 5 })

    const onNext = () => {
        const hasNextCard = current.card + 1 >= (slide?.cards.length ?? 0)
        if (hasNextCard) {
            setCurrent({
                card: 0,
                slide: current.slide + 1
            })
        } else
            setCurrent({
                ...current,
                card: current.card + 1
            })
    }

    const onPrev = () => {
        const hasPrevCard = current.card - 1 < 0 && current.slide > 0
        if (hasPrevCard) {

            const prevSlide = slides.at(current.slide - 1)
            const prevCardIndex = prevSlide ? prevSlide.cards.length - 1 : 0

            setCurrent({
                ...current,
                slide: current.slide - 1,
                card: prevCardIndex
            })

        } else if (current.card - 1 >= 0)
            setCurrent({
                ...current,
                card: current.card - 1
            })
    }

    const numCards = slide?.cards.length ?? 0

    return <div {...rest}>
        <SlideInput
            onNext={onNext}
            onPrev={onPrev}
        >
            {slide && <PresenterPrompt>
                <>
                    <SlideInfo>
                        <span>Card {Math.min(current.card + 1, numCards)} of {numCards}</span>
                        <span>Slide {Math.min(current.slide + 1, slides.length)} of {slides.length} </span>
                    </SlideInfo>
                    {writeOnPrompt}
                </>
            </PresenterPrompt>}
        </SlideInput>

    </div>
})`

    display: flex;
    justify-content: center;

    font-size: 125%;
    width: 100%;
    background-color: ${ACCENT_COLOR};
    min-height: 12em;

`

//// Exports ////

export default Presenter

export {
    Presenter,
    PresenterProps
}