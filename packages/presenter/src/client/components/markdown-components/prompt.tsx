import React, { ReactElement } from 'react'
import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// Prompt Component ////

interface PromptProps extends MarkdownComponentProps {}

const Prompt = (props: PromptProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Exports ////

export default Prompt

export {
    Prompt,
    PromptProps
}