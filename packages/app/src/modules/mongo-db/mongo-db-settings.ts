import { $, Infer } from '@benzed/schema'

import { $port } from '../../util/schemas'
import { DEFAULT_MONGODB_PORT } from '../../util'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Settings ////

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $
        .string
        .optional
        .default(
            'mongodb://127.0.0.1:<port>/<database>'
        )
        .asserts(
            uri => uri.includes('<database>'), 
            '<database> tag required'
        ),

    database: $.string,

    port: $port
        .optional
        .default(DEFAULT_MONGODB_PORT),

    user: $
        .string
        .optional,

    password: $
        .string
        .optional,

})

//// Exports ////

export {

    MongoDbSettings,
    $mongoDbSettings

}