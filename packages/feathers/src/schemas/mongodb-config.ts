
import $ from "@benzed/schema"
import { $port } from "./util"

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Exports ***/

const $mongoDBConfig = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,
})

/*** Exports ***/

export default $mongoDBConfig

export {
    $mongoDBConfig
}