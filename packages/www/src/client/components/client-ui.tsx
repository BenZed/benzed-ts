import React, { ReactElement, ReactNode } from 'react'

import { useSlide } from '../hooks'

//// ClientUi Component ////

interface ClientUIProps {
    children?: ReactNode
}

const ClientUI = (props: ClientUIProps): ReactElement => {

    const [ slide, setSlide ] = useSlide()

    return <div>

        { slide }

        <button onClick={() => setSlide(slide + 1)}>
            Increment Slide
        </button>

    </div>
}

//// Exports ////

export default ClientUI

export {
    ClientUI,
    ClientUIProps
}