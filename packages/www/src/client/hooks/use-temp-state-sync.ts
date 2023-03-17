import { useEffect } from 'react'

import { useStoredJson } from '@benzed/react'
import { onInterval } from '@benzed/async'
import { GetCommand, CommandInput, CommandOutput } from '@benzed/app'

// Eventually this will be replaced with @benzed/app state sync functionality
export const useTempStateSync = <C extends GetCommand>(
    getCommand: C, 
    defaultOutput: CommandOutput<C>, 
    input: CommandInput<C>,
    interval = 5000
) => {

    const [ state, setState ] = useStoredJson(
        getCommand.pathFromRoot.join('/'),
        defaultOutput
    )

    useEffect(
        () => {
            const syncronize = () => getCommand(input).then(setState)
            syncronize()
            return onInterval(syncronize, interval)
        },
        [input, interval]
    )

    return [ state, setState ] as const
}