import { createClientRenderer } from '../render-service/client-renderer'
import os from 'os'

/*** Execute ***/

void createClientRenderer({
    host: 'http://localhost:3000'
}).then(client => client
    .service('files/render')
    .create({
        maxConcurrent: os.cpus().length - 1
    })
)

