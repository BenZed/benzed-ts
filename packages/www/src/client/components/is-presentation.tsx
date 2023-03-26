import { AsClient } from '@benzed/app'
import { WWW } from '../../app'

import React, { ReactElement} from 'react'

import {

    BasicMarkdown,
    createPresentationJson,

    Presentation,
    MarkdownComponentMap,
    MarkdownComponentProps,

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

interface SlideProps extends MarkdownComponentProps {}

const Slide = (props: SlideProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Prompt Component ////

interface PromptProps extends MarkdownComponentProps {}

const Prompt = (props: PromptProps): ReactElement => {
    const { markdown } = props
    return <em>{markdown}</em>
}

//// IsPresentation Component ////

interface IsPresentationProps {
    client: AsClient<WWW>
}

const IsPresentation = ({ client }: IsPresentationProps): ReactElement => {

    void client
    const components = { Slide, Prompt } satisfies MarkdownComponentMap

    const presentation = createPresentationJson(components, example)

    return <>
        <Presentation                                                                            
            components={components}
            presentation={presentation}
            currentIndex={1}
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