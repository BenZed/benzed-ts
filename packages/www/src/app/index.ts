import { website } from './www'

//// Exports ////

export const server = website.asServer()

export const client = website.asClient()