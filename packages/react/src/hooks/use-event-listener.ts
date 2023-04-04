import { Func as Listener } from '@benzed/util'
import { useEffect } from 'react'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface EventEmitterLike {

    addEventListener(event: string, listener: Listener): void
    removeEventListener(event: string, listener: Listener): void

}

type ListenParams<E extends EventEmitterLike> = Parameters<E['addEventListener']>

//// Main ////

export const useEventListener = <E extends EventEmitterLike>(emitter: E, ...[event, listener]: ListenParams<E>) => 
    useEffect(() => {

        emitter.addEventListener(event, listener)

        return () => emitter.removeEventListener(event, listener)
    })