
import { Collection } from 'mongodb'
import { MongoDbApp, createMongoDbApp } from './mongo-db-app'

import { isLogger } from '@benzed/util'

import { AppEmit } from '../../types'

let mongoDbApp: MongoDbApp
beforeAll(() => {
    mongoDbApp = createMongoDbApp()
})

it(`creates a mongo application`, () => {
    expect(mongoDbApp).toHaveProperty(`log`)
    expect(mongoDbApp).toHaveProperty(`db`)
    expect(mongoDbApp).toHaveProperty(`start`)
})

describe(`db() method`, () => {
    it(`returns a collection instance`, async () => {
        await mongoDbApp.start()

        expect(await mongoDbApp.db(`users`))
            .toBeInstanceOf(Collection)

        await mongoDbApp.teardown()
    })
})

describe(`log() method`, () => {
    it(`is an instance of @benzed/util Logger`, () => {
        expect(isLogger(mongoDbApp.log))
            .toBe(true)
    })
})

describe(`mode()`, () => {
    it(`returns the current env`, () => {
        expect(mongoDbApp.env())
            .toEqual(`test`)
    })
})

describe(`start()`, () => {
    it(`emits listen method with port and nev`, async () => {
        let listen!: [number, string]
        (mongoDbApp as unknown as AppEmit).on(`listen`, (port,env) => {
            listen = [port,env]
        })
        await mongoDbApp.start()
        await mongoDbApp.teardown()

        expect(listen).toEqual([
            mongoDbApp.get(`port`), 
            `test`
        ])
    })
})
