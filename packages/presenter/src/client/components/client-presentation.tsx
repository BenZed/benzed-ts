import React, { ReactElement, useState } from 'react'
import { useMatch } from 'react-router-dom'

import { useIntervalEffect } from '@benzed/react'
import { clamp } from '@benzed/math'

import {
    Presentation,
    PresentationJson,
    PresentationControls,
    getCurrentPresentationJson
} from './presentation'

import * as markdownComponents from './markdown-components'
import { PromptContainer } from './markdown-components/prompt'

import { useClient } from './client-context'
import { Container } from '@mantine/core'

//// Types ////

type MarkdownComponents = typeof markdownComponents

//// Hooks ////

const usePresentationJson = () => {
    const client = useClient()

    const [ json, setJson ] = useState<PresentationJson<MarkdownComponents>[]>([])

    useIntervalEffect(() =>
        void client
            .presenter
            .getPresentationJson()
            .then(setJson)
    , 5000)

    return json
}

const useCurrentIndex = (maxIndex = Infinity) => {

    const client = useClient()

    const [ currentIndex, setCurrentIndexLocal ] = useState(0)

    // sync state
    useIntervalEffect(() => 
        void client
            .presenter
            .getCurrentIndex()
            .then(setCurrentIndexLocal)
    , 1000)

    // set-current-index
    const setCurrentIndex = async (index: number) => {

        const sanitizedIndex = clamp(index, 0, maxIndex)

        setCurrentIndexLocal(sanitizedIndex)
        await client.presenter.setCurrentIndex(sanitizedIndex)
    }

    return [ currentIndex, setCurrentIndex ] as const
}

//// Props ////

interface ClientPresentationProps {}

//// Component ////

export const ClientPresentation = (props: ClientPresentationProps): ReactElement => {

    void props
    const presentation = usePresentationJson()

    const maxIndex = presentation.length - 1
    const [ currentIndex, setCurrentIndex ] = useCurrentIndex(maxIndex)

    const currentPresentation = getCurrentPresentationJson(presentation, currentIndex)

    const isPresenter = !!useMatch('/presenter')

    return <>

        {
            isPresenter

                ? <PresentationControls
                    maxIndex={maxIndex}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                >
                    <PromptContainer />
                </PresentationControls>

                : <PromptContainer sx={{ display: 'none' }}/>
        }

        <Container>
            <Presentation
                presentation={currentPresentation}
                components={markdownComponents}
            />
        </Container>

    </>
}
