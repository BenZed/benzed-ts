import { isPort } from '@benzed/app'
import { Server } from '../server'

//// Data ////

const port = isPort
    .default(() => 8000)
    .validate(process.env.PORT)

//// Execute ////

const server = new Server()

void server.start(port)
