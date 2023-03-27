import React, { Dispatch, ReactElement } from 'react'

import { each, nil } from '@benzed/util'

import { MarkdownComponent, MarkdownComponentMap } from './markdown-component'
import { BasicMarkdown } from './basic-markdown-component'

import createPresentationState from './create-presentation-state'
import { PresentationJson } from './create-presentation-json'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ContentLayout ////

interface PresentationProps<P extends MarkdownComponentMap> {

    readonly components: P
    readonly presentation: PresentationJson<P>[]
    readonly currentIndex: number
    readonly setCurrentIndex?: Dispatch<number>
}

const Presentation = <P extends MarkdownComponentMap>(props: PresentationProps<P>): ReactElement => {

    const { presentation, components, currentIndex } = props

    const [state] = createPresentationState(presentation, currentIndex)

    const contentsResolved = state.map(state => ({
        Component: getMarkdownComponent(state.component, components),
        markdown: state.markdown
    }))

    return <>{
        contentsResolved.map(({ Component, markdown }, i) =>
            <Component 
                key={i} 
                markdown={markdown} 
            />
        )
    }</>
}

//// Helper ////

const getMarkdownComponent = <P extends MarkdownComponentMap>(name: string | nil, components: P): MarkdownComponent => {

    if (!name)
        return BasicMarkdown

    if (!(name in components)) {
        throw new Error(
            `No component named "${name}" in component list: ${each.nameOf(components)}`
        )
    }

    return components[name]
}

//// Exports ////

export {
    Presentation,
    PresentationProps
}