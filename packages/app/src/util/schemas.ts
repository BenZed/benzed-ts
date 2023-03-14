import is from '@benzed/is'

import { DEFAULT_SERVER_PORT } from './constants'

//// Exports ////

export const isPort = is
    .number
    .min(1025)
    .max(65536)
    .default(() => DEFAULT_SERVER_PORT)
    .named('Port')