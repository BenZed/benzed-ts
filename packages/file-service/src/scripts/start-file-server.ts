import { createFileServerApp } from '../server'

/*** Execute ***/

const fileServerApp = createFileServerApp()

process.on(`unhandledRejection`, (reason, p) =>
    fileServerApp
        .log
        .error`Unhandled Rejection at: Promise ${p} ${reason}`
)

void fileServerApp.start()