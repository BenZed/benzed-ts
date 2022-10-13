import { disallow } from '@benzed/feathers'

export const around = {

    create: [
        disallow('server')
    ],

    remove: [
        disallow('external')
    ]

}