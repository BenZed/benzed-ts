import React, { ReactElement, useEffect, useState } from 'react'

import { onInterval } from '@benzed/async'

import { useClient } from './client-context'
import { Presentation, PresentationJson } from './presentation'
import * as markdownComponents from './markdown-components'

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
    })

    return json
}

const useCurrentIndex = () => {

    const client = useClient()

    const [ currentIndex, setCurrentIndexLocal ] = useState(0)

    // sync state
    useEffect(() => 
        onInterval(() => 
            client
                .presenter
                .getCurrentIndex()
                .then(setCurrentIndexLocal)
        , 500)
    , [])

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
    const [currentIndex, setCurrentIndex] = useCurrentIndex()

    return <Presentation
        
        presentation={presentation}
        components={markdownComponents}

        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
    />

}
