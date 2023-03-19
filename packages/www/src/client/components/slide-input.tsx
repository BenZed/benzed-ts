import React, { ReactElement } from 'react'
import styled from 'styled-components'
import { useSlide } from '../hooks'

//// Helper ////

const SlideButton = styled.button`
    border: none;
    background: none;
`

const SlideNumber = styled.span`
`

//// Presenter Component ////

interface PresenterProps {
}

const SlideInput = styled((props: PresenterProps): ReactElement => {
    const { ...rest } = props

    const [slide, current, setCurrent] = useSlide()

    return <div {...rest}>

        <SlideButton onClick={() => setCurrent(-1)}>⬅️</SlideButton>

        <SlideNumber>{current}</SlideNumber>

        <SlideButton onClick={() => setCurrent(+1)}>➡️</SlideButton>

    </div>
})`


`

//// Exports ////

export default SlideInput

export {
    SlideInput,
    PresenterProps
}