
import { resolveAll } from '@benzed/feathers'
import { authenticate } from '@feathersjs/authentication'
import '@feathersjs/hooks'

import usersResolvers from '../resolvers'

/*** Exports ***/

export const around = {

    all: [],

    get: [
        authenticate('jwt'),
        resolveAll(usersResolvers)
    ],

    find: [
        authenticate('jwt'),
        resolveAll(usersResolvers)
    ],

    create: [
        resolveAll(usersResolvers)
    ],

    patch: [
        authenticate('jwt'),
        resolveAll(usersResolvers)
    ],

    update: [
        authenticate('jwt'),
        resolveAll(usersResolvers)
    ],

    remove: [
        authenticate('jwt'),
        resolveAll(usersResolvers)
    ]
}

export const before = {}

export const after = {}

export const error = {}

