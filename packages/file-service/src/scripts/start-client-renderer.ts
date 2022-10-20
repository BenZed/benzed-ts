import { createFileRenderApp } from '../client/create-file-render-app'
import os from 'os'

/*** Execute ***/

void createFileRenderApp({
    host: 'http://localhost:3000'
}).then(client => client
    .service('files/render')
    .create({
        maxConcurrent: os.cpus().length - 1
    })
)

