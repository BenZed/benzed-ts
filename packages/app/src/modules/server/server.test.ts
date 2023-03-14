
import { test, describe } from '@jest/globals'

import { App } from '../../app'

//// Setup ////

const testApp = new class TestApp extends App {}
const testServer = testApp.asServer()

//// Tests ////

describe('onValidate', () => {

    test.todo('asserts unique: no other client (or server) may be on the app')

    test.todo('asserts root parent: must be parented directly to the app')

})

describe('settings', () => {

    test.todo('port number, between 1025 and 65536')

    test.todo('server state is it\'s own settings')

})

describe('start', () => {

    test.todo('http server listens on app start')

})

describe('stop', () => {

    test.todo('http server stops listening on app stop')

})