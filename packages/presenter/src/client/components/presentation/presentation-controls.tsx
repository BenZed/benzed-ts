import React, { Dispatch, ReactElement } from 'react'

import { useKeyPress } from '@benzed/react'

//// Presentation Controls Component ////

interface PresentationControlsProps { 
    readonly currentIndex: number
    readonly setCurrentIndex: Dispatch<number>
}

const PresentationControls = (props: PresentationControlsProps): ReactElement => {

    const {
        currentIndex,
        setCurrentIndex
    } = props

    const prevIndex = () =>
        setCurrentIndex(currentIndex - 1)

    const nextIndex = () =>
        setCurrentIndex(currentIndex + 1)

    useKeyPress({
        'LeftArrow': prevIndex,
        'RightArrow': nextIndex
    })

    return <>{currentIndex}</>
}

//// Exports ////

export default PresentationControls

export {
    PresentationControls,
    PresentationControlsProps
}