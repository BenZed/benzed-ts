import React, { ReactElement } from 'react'

import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

import { Container, ContainerProps, Portal, Sx } from '@mantine/core'

//// Constants ////

const DEFAULT_PROMPT_CONTAINER_ID = 'prompt-container'

//// Styles ////

const onlyShowLastPrompt: Sx = {
    '> :not(:last-child)': {
        display: 'none'
    }
}

//// Prompt Component ////

interface PromptProps extends MarkdownComponentProps {
    containerId?: string
}

const Prompt = (props: PromptProps): ReactElement => {

    const { markdown, containerId = DEFAULT_PROMPT_CONTAINER_ID } = props

    return <Portal target={`#${containerId}`}>
        <BasicMarkdown markdown={markdown} />
    </Portal>

}

//// Prompt Container ////

interface PromptContainerProps extends ContainerProps {}

const PromptContainer = ({ id = DEFAULT_PROMPT_CONTAINER_ID, ...props }: PromptContainerProps): ReactElement => 
    <Container id={id} sx={onlyShowLastPrompt} {...props} />

//// Exports ////

export {

    PromptProps,
    Prompt,

    PromptContainerProps,
    PromptContainer,

}