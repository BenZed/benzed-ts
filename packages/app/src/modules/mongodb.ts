import { $, Infer } from '@benzed/schema'

import { $logIcon, $port } from "../schemas"
import { Module, ModuleSetting } from "../module"

/*** Base ***/

/**
 * Just in case I intend to add support for more databases later,
 * they should all have the same interface
 */
abstract class Database<S extends ModuleSetting> extends Module<S> {

}

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Types ***/

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{

}

const $mongoDbSettings = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,

    logIcon: $logIcon

})

/*** MongoDb ***/

class MongoDb extends Database<Required<MongoDbSettings>> {

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(settings) as Required<MongoDbSettings>
        )
    }

    constructor(
        settings: Required<MongoDbSettings>
    ) {
        super(settings)
    }

}

/*** Exports ***/

export {
    MongoDb,
    MongoDbSettings,
    $mongoDbSettings,

    DEFAULT_MONGODB_PORT
}