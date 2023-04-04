import React, { ReactElement, useEffect, useState } from 'react'
import { useMatch } from 'react-router-dom'

import { useIntervalEffect } from '@benzed/react'

import {
    Presentation,
    PresentationJson,
    PresentationControls
} from './presentation'

import * as markdownComponents from './markdown-components'
import { PromptContainer } from './markdown-components/prompt'

import { useClient } from './client-context'

//// Hooks ////

const usePresentationJson = () => {
    const client = useClient()

    type MarkdownComponents = typeof markdownComponents

    const [ json, setJson ] = useState<PresentationJson<MarkdownComponents>[]>([])

    useEffect(() => {
        client
            .presenter
            .getPresentationJson()
            .then(setJson)
    }, [])

    return json
}

const useCurrentIndex = () => {

    const client = useClient()

    const [ currentIndex, setCurrentIndexLocal ] = useState(0)

    // sync state every 500ms
    useIntervalEffect(() => 
        client
            .presenter
            .getCurrentIndex()
            .then(setCurrentIndexLocal)
    , 1000)

    // set-current-index
    const setCurrentIndex = async (index: number) => {
        setCurrentIndexLocal(index)
        await client.presenter.setCurrentIndex(index)
    }

    return [ currentIndex, setCurrentIndex ] as const
}

//// Props ////

interface ClientPresentationProps {}

//// Component ////

export const ClientPresentation = (props: ClientPresentationProps): ReactElement => {

    void props
    const presentation = usePresentationJson()
    const [ currentIndex, setCurrentIndex ] = useCurrentIndex()

    const isPresenter = !!useMatch('/presenter')

    return <>

        {
            isPresenter
                ? <PresentationControls
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                >
                    <PromptContainer />
                </PresentationControls>
                : <PromptContainer sx={{ display: 'none' }}/>
        }

        <Presentation
            presentation={presentation}
            components={markdownComponents}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
        />

    </>
}
