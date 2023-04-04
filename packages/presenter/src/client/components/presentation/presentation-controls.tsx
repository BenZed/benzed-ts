import React, { Dispatch, ReactElement } from 'react'

import { useKeyPress } from '@benzed/react'
import { Container, Flex, Text, Sx, Button } from '@mantine/core'

//// Presentation Controls Component ////

interface PresentationControlsProps { 
    readonly currentIndex: number
    readonly setCurrentIndex: Dispatch<number>
    readonly portalId?: string
}

const presentationStyle: Sx = t => ({
    position: 'absolute',
    bottom: '1em',
    left: '1em',
    right: '1em',
    background: t.fn.rgba(t.white, 0.125),
    borderRadius: t.radius.md,
    padding: 0
})

const PresentationControls = (props: PresentationControlsProps): ReactElement => {

    const {
        portalId,
        currentIndex,
        setCurrentIndex
    } = props

    const prevIndex = () => setCurrentIndex(currentIndex - 1)

    const nextIndex = () => setCurrentIndex(currentIndex + 1)

    useKeyPress({
        'ArrowLeft': prevIndex,
        'ArrowRight': nextIndex
    })

    return <Container sx={presentationStyle}>

        <Flex direction='column'>

            <Flex direction='row' align='center' justify='center'>
                <Button onClick={prevIndex} sx={{ marginRight: 'auto' }}>Prev</Button>
                <Text>{currentIndex}</Text>
                <Button onClick={nextIndex} sx={{ marginLeft: 'auto' }}>Next</Button>
            </Flex>

            <Container id={portalId} />
        </Flex>

    </Container>
}

//// Exports ////

export default PresentationControls

export {
    PresentationControls,
    PresentationControlsProps
}