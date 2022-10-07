
import { resolveAll } from '@benzed/feathers'
import { authenticate } from '@feathersjs/authentication'
//
import '@feathersjs/hooks'

import fileResolvers from '../resolvers'

/*** Exports ***/

export const around = {

    all: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    get: [],

    find: [],

    create: [],

    patch: [],

    update: [],

    remove: []

}

export const before = {}

export const after = {}

export const error = {}

