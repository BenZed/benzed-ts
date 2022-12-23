import { Module } from '@benzed/ecs'
import { $ } from '@benzed/schema'
import { toCamelCase } from '@benzed/string'

//// Exports ////

export class Name<N extends string> extends Module<N> {

    constructor(name: N) {

        void $.string
            .validates(toCamelCase, 'must be in camelCase')
            .assert(name)

        super(name)
    }

    getName(): N {
        return this.data
    }

}