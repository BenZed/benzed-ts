import React, { useState, useEffect, ReactElement, ReactNode } from 'react'

import { Command, CommandOutput, CommandInput } from '@benzed/app'
import { onInterval } from '@benzed/async'
import { is } from '@benzed/is'

import { useClient } from './client-context'

//// Hooks ////

const useSlide = () => {

    const client = useClient()

    const [ slide, setSlide ] = useTempCommandStateSync(
        client.slide.get,
        client.slide.value,
        undefined
    )

    const setSlideAsync = (slide: number) => {
        client.slide.set(slide)
        setSlide(slide)
    }

    return [ slide, setSlideAsync ] as const
}

// Eventually this will be replaced with @benzed/app state sync functionality
const useTempCommandStateSync = <C extends Command>(cmd: C, def: CommandOutput<C>, input: CommandInput<C>, interval = 5000) => {

    const [ state, setState ] = useState(def)

    useEffect(
        () => onInterval(
            () => cmd(input).then(setState),
            interval
        ), 
        [input]
    )

    return [ state, setState ] as const
}

//// ClientUi Component ////

interface ClientUIProps {
    children?: ReactNode
}

const ClientUI = (props: ClientUIProps): ReactElement => {
    const { children, ...rest } = props

    const [ slide, setSlide ] = useSlide()
    
    return <div>
        {slide}

        <button onClick={() => setSlide(slide + 1)}>Increment Slide</button>
    </div>
}

//// Exports ////

export default ClientUI

export {
    ClientUI,
    ClientUIProps
}