import { Schema, SchemaFor } from '@benzed/schema'

import feathersConfiguration from '@feathersjs/configuration'
import { Application } from '@feathersjs/koa'

/* eslint-disable @typescript-eslint/no-explicit-any */

const getDefaultConfiguration = <C>(): C =>
    feathersConfiguration()() as unknown as C

/*** Main ***/

/**
 * Validate an app configuration using @benzed/schema 
 * If a configuration is not provided it will be taken
 * from the /config folder with feather's default behaviour
 */
function configure<C>(
    input: SchemaFor<C> | C = getDefaultConfiguration()
): (app: Application<any, C>) => void {

    const config = input instanceof Schema
        ? input.validate(getDefaultConfiguration())
        : input ?? getDefaultConfiguration()

    return (app: Application<any, C>): void => {
        for (const key in config)
            app.set(key, config[key])
    }
}

/*** Exports ***/

export default configure

export {
    configure,
    getDefaultConfiguration
}