import React, { Dispatch, ReactElement } from 'react'

import {

    ContentComponentMap,
    Contents,
    ContentJson,

} from './content'

//// Types ////

//// PresentationComponent ////

interface PresentationProps<P extends ContentComponentMap> {
    components: P
    contents: ContentJson<P>
}

const Presentation = <P extends ContentComponentMap>(props: PresentationProps<P>): ReactElement => {

    const { ...rest } = props

    return <> </>
}

//// Exports ////

export default Presentation

export {
    Presentation,
    PresentationProps,
}