import { Module } from './module'

import { test } from '@jest/globals'

//// Tests ////

test(`${Module.name}`, () => {

    class M2 extends Module {
    }

    class M3 extends Module<() => number> {
        constructor() {
            super(() => 0)
        }
    }

})
