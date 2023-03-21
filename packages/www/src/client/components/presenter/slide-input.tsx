import React, { ReactElement, ReactNode, useState } from 'react'

import styled from 'styled-components'

//// Helper ////

const SlideButton = styled.button`
    border: none;
    background: none;
    margin: 0.5em;
`
//// Presenter Component ////

interface SlideInputProps {
    onNext: () => void,
    onPrev: () => void
}

const SlideInput = styled(({ onNext, onPrev, ...rest }: SlideInputProps): null | ReactElement =>
    <div {...rest}>

        <SlideButton onClick={onPrev}>⬅️</SlideButton>
        <SlideButton onClick={onNext}>➡️</SlideButton>

    </div>
)`

    display: flex;
    align-items: center;

`

//// Exports ////

export default SlideInput

export {
    SlideInput,
    SlideInputProps
}