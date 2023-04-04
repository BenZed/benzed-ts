import { EffectCallback, DependencyList, useEffect } from 'react'

import { onInterval } from '@benzed/async'

//// Hooks ////

export const useIntervalEffect = (
    callback: EffectCallback,
    interval = 500,
    dependencies: DependencyList = []
) =>
    useEffect(() =>
        onInterval(callback, interval), dependencies
    )

