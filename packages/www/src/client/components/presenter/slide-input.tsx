import React, { ReactElement, ReactNode } from 'react'

import styled from 'styled-components'

import { useKeyPress } from '../../hooks'

//// Helper ////

const SlideButton = styled.button`
    border: none;
    background: none;
    margin: 0.5em;

    font-size: 2.5em;
    font-weight: bold;

    color: inherit;

    :hover {
        transform: scale(1.25,1.25);
    }

    :active {
        transform: scale(1.5,1.5);
    }
`
//// Presenter Component ////

interface SlideInputProps {
    onNext: () => void,
    onPrev: () => void,
    children?: ReactNode
}

const SlideInput = styled(({ onNext, onPrev, children, ...rest }: SlideInputProps): null | ReactElement => {

    useKeyPress({
        'ArrowLeft': onPrev,
        'ArrowRight': onNext
    })

    return <div {...rest}>

        <SlideButton onClick={onPrev}>{'<'}</SlideButton>
        {children}
        <SlideButton onClick={onNext}>{'>'}</SlideButton>

    </div>
})`
    display: flex;
`

//// Exports ////

export default SlideInput

export {
    SlideInput,
    SlideInputProps
}