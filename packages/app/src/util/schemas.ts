import is, { IsType } from '@benzed/is'

import { DEFAULT_SERVER_PORT } from './constants'

//// Exports ////

export const isPort = is
    .number
    .min(1025)
    .max(65536)
    .default(() => DEFAULT_SERVER_PORT)
    .named('Port')

export const isPath = is
    .string
    .trim()
    .startsWith('/', 'must start with a "/"')
    .transforms(
        s => s.replace(/\/+/g, '/'), 
        'must not have multiple consecutive "/"s'
    )
    .transforms(
        s => s.replace(/\/$/, '') || '/',
        //                            ^ in case we just removed the last slash
        'must not end with a "/"'
    )
    .named('Path') as IsType<`/${string}`> 

export type Path = typeof isPath.type