import React, { HTMLProps, ReactElement } from 'react'

//// Types ////

export type AnchorProps = HTMLProps<HTMLAnchorElement>

//// Exports ////

export const Anchor = ({ href, children, ...rest }: AnchorProps): ReactElement =>
    <a href={href} {...rest} >{children}</a>
