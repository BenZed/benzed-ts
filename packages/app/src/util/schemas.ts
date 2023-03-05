import is from '@benzed/is'
import { DEFAULT_SERVER_PORT } from './constants'

//// Exports ////

export const isPort = is
    .number
    .named('Port')
    .default(() => DEFAULT_SERVER_PORT)
    .range(1025, '...', 65536)