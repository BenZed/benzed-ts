import createFileServerApp from '../server'

/*** Execute ***/

void async function serve() {

    const app = createFileServerApp()

    process.on('unhandledRejection', (reason, p) =>
        app.log.error`Unhandled Rejection at: Promise ${p} ${reason}`
    )

    const port = app.get('port')
    const env = app.get('env')

    const server = app.listen(port)

    await new Promise((resolve, reject) => {
        server.once('listening', resolve)
        server.once('error', reject)
    })

    void app.log`File Server started in ${env} mode on port ${port}`

}()
