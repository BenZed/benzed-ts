import createFileServerApp from '../server'

/*** Execute ***/

void async function startFileServer() {

    const fileServerApp = createFileServerApp()

    process.on('unhandledRejection', (reason, p) =>
        fileServerApp
            .log
            .error`Unhandled Rejection at: Promise ${p} ${reason}`
    )

    await fileServerApp.start()

}()
