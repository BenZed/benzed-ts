import React, { Dispatch, ReactNode, ReactElement } from 'react'

import { useKeyPress } from '@benzed/react'
import { Overlay, Flex, Sx, Button, Title } from '@mantine/core'
import { clamp } from '@benzed/math'

//// Styles ////

const stickToBottom: Sx = t => ({
    position: 'absolute',
    top: 'inherit',
    bottom: '1em',
    left: '1em',
    right: '1em',
    background: t.fn.rgba(t.white, 0.125),
    borderRadius: t.radius.md,
})

//// Props ////

interface PresentationControlsProps { 
    readonly maxIndex: number
    readonly currentIndex: number
    readonly setCurrentIndex: Dispatch<number>
    readonly children?: ReactNode
}

//// Component ////

const PresentationControls = (props: PresentationControlsProps): ReactElement => {

    const {
        children,
        maxIndex,
        currentIndex,
        setCurrentIndex
    } = props

    const prevIndex = () => setCurrentIndex(currentIndex - 1)

    const nextIndex = () => setCurrentIndex(currentIndex + 1)

    useKeyPress({
        'ArrowLeft': prevIndex,
        'ArrowRight': nextIndex
    })

    const max = maxIndex + 1
    const current = clamp(currentIndex + 1, 0, max)

    return <Overlay component={Flex} blur={15} direction='column' sx={stickToBottom}>

        {children}

        <Flex direction='row' align='center' justify='center'>

            <Button onClick={prevIndex} sx={{ marginRight: 'auto' }}>Prev</Button>

            <Title order={2}>{current} of {max}</Title>

            <Button onClick={nextIndex} sx={{ marginLeft: 'auto' }}>Next</Button>

        </Flex>

    </Overlay>
}

//// Exports ////

export default PresentationControls

export {
    PresentationControls,
    PresentationControlsProps
}