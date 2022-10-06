
import { resolveAll } from '@benzed/feathers'
import { authenticate } from '@feathersjs/authentication'
import '@feathersjs/hooks'

import fileResolvers from '../resolvers'

/*** Exports ***/

export const around = {

    all: [],

    get: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    find: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    create: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    patch: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    update: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ],

    remove: [
        authenticate('jwt'),
        resolveAll(fileResolvers)
    ]

}

export const before = {}

export const after = {}

export const error = {}

