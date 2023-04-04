import React, { Dispatch, ReactNode, ReactElement } from 'react'

import { useKeyPress } from '@benzed/react'
import { Flex, Sx, Button, Title } from '@mantine/core'

//// Styles ////

const stickToBottom: Sx = t => ({
    position: 'absolute',
    bottom: '1em',
    left: '1em',
    right: '1em',
    background: t.fn.rgba(t.white, 0.125),
    borderRadius: t.radius.md,
})

//// Props ////

interface PresentationControlsProps { 
    readonly currentIndex: number
    readonly setCurrentIndex: Dispatch<number>
    readonly children?: ReactNode
}

//// Component ////

const PresentationControls = (props: PresentationControlsProps): ReactElement => {

    const {
        children,
        currentIndex,
        setCurrentIndex
    } = props

    const prevIndex = () => setCurrentIndex(currentIndex - 1)

    const nextIndex = () => setCurrentIndex(currentIndex + 1)

    useKeyPress({
        'ArrowLeft': prevIndex,
        'ArrowRight': nextIndex
    })

    return <Flex direction='column' sx={stickToBottom}>

        {children}

        <Flex direction='row' align='center' justify='center'>

            <Button onClick={prevIndex} sx={{ marginRight: 'auto' }}>Prev</Button>

            <Title order={2}>{currentIndex}</Title>

            <Button onClick={nextIndex} sx={{ marginLeft: 'auto' }}>Next</Button>

        </Flex>

    </Flex>
}

//// Exports ////

export default PresentationControls

export {
    PresentationControls,
    PresentationControlsProps
}