import React, { ReactElement } from 'react'
import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'
import { Center } from '@mantine/core'

//// SlideTitle Component ////

interface CenterHeaderProps extends MarkdownComponentProps {}

const CenterHeader = (props: CenterHeaderProps): ReactElement => 
    <Center sx={{ fontSize: '200%', height: '100vh' }}>
        <BasicMarkdown {...props} />
    </Center>

//// Exports ////

export default CenterHeader

export {
    CenterHeader,
    CenterHeaderProps
}