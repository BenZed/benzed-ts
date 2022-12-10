import { toVoid } from '@benzed/util'

import { Module } from '../module'
import { App } from '../app'

import { Logger } from './logger'

//// Setup ////

const testLogger = Logger.create({
    onLog: toVoid,
    cacheLength: 6
})

class Icon extends Module {
    static readonly icon = '@' 
}

class NoIcon extends Module {}

const app = App
    .create()
    .useModule(testLogger)
    .useModule(new Icon())
    .useModule(new NoIcon())

//// Tests ////

const timestamp = expect.any(String)

let logger: Logger
let icon: Icon
let noIcon: NoIcon
beforeAll(() => app.start())

beforeAll(() => {
    logger = app.findModule(Logger, true)
    logger.log`This should be omitted`

    noIcon = app.findModule(NoIcon, true)
    noIcon.log.info`Info`
    noIcon.log.warn`Warn`
    noIcon.log.error`Error`
    
    icon = app.findModule(Icon, true)
    icon.log.info`Info`
    icon.log.warn`Warn`
    icon.log.error`Error`

})

afterAll(() => app.stop())

it('takes input of any module\'s log method', () => {
    expect(logger.logs[0]).toEqual([timestamp, 'Info'])
})

it('adds warn icon', () => {
    expect(logger.logs[1]).toEqual([timestamp, '⚠️', 'Warn'])
})

it('adds error icon', () => {
    expect(logger.logs[2]).toEqual([timestamp, '‼️', 'Error'])
})

it('uses module icon, if defined', () => {
    expect(logger.logs[3]).toEqual([Icon.icon, timestamp, 'Info'])
    expect(logger.logs[4]).toEqual([Icon.icon, timestamp, '⚠️', 'Warn'])
    expect(logger.logs[5]).toEqual([Icon.icon, timestamp, '‼️', 'Error'])
})

it('respects cache length', () => {
    expect(logger.logs.some(l => l.includes('This should be omitted'))).toBe(false)
})