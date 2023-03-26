import { AsClient } from '@benzed/app'
import { WWW } from '../../app'

import React, { ReactElement} from 'react'

import {
    ContentComponentMap,
    ContentComponentProps,
    Contents,
    createContentJson,
    getContentState,
    Markdown
} from './presentation'

import { GlobalStyle } from './global-style'

//// Ace ////

const example =
`
Before a component boundary, Markdown is rendered in regular markdown

<!-- @Slide -->
Component boundaries split markdown to be fed into different components.
If a component named "Slide" cannot be found in the component manifest, an error will be thrown.

    <!-- @Prompt -->
    Nesting provides more state boundary control.

This content will belong to the slide component, but will not become visible until the @Prompt is within
state scope.

<!-- @Slide -->
Current state can be configured to show a range of slides.
`

//// Slide Component ////

interface SlideProps extends ContentComponentProps {}

const Slide = (props: SlideProps): ReactElement => {

    const { content } = props

    return <Markdown content={content} />
}

//// Prompt Component ////

interface PromptProps extends ContentComponentProps {}

const Prompt = (props: PromptProps): ReactElement => {
    const { content } = props
    
    return <em>{content}</em>
}

//// IsPresentation Component ////

interface IsPresentationProps {
    client: AsClient<WWW>
}

const IsPresentation = (props: IsPresentationProps): ReactElement => {
    const { client, ...rest } = props
    
    const components = { Slide, Prompt } satisfies ContentComponentMap

    const json = createContentJson(components, example)

    const [content] = getContentState(json, 1)

    return <>
        <Contents 
            components={components}
            content={content} 
        />
        <GlobalStyle/>
    </>
}

//// Exports ////

export default IsPresentation

export {
    IsPresentation,
    IsPresentationProps
}