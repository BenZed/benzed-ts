import React, { ReactElement } from 'react'

//// Props ////

type GearsFileBrowserProps = {
    type: 'folder'
    name: string
    contents: GearsFileBrowserProps[]
    open?: boolean
    template?: { name: string, state?: 'changes' | 'checked-out' }
} | {
    type: 'file'
    name: string
    ext: string
}

//// FileBrowser Component ////

const GearsFileBrowser = (props: GearsFileBrowserProps): ReactElement => {
    
    return <>FileBrowser</>
}

//// Exports ////

export {
    GearsFileBrowser,
    GearsFileBrowserProps
}