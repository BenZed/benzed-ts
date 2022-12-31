import { toVoid } from '@benzed/util'
import { Node } from '@benzed/ecs'

import { Logger } from './logger'
import { AppModule } from '../app-module'

//// Setup ////

const testLogger = Logger.create({
    onLog: toVoid,
    cacheLength: 6
})

class Icon extends AppModule<void> {
    static readonly icon = '@'  
}

class NoIcon extends AppModule<void> {}

const logTest = Node.from(
    {
        loggers: Node.from(
            new Icon(),
            new NoIcon()
        )
    },
    testLogger
)

//// Tests ////

const timestamp = expect.any(String)

let logger: Logger
let icon: Icon
let noIcon: NoIcon   

beforeAll(() => {
    logger = logTest.assertModule(Logger)
    logger.log`This should be omitted` 

    noIcon = logTest.assertModule.inDescendents(NoIcon)
    noIcon.log.info`Info`
    noIcon.log.warn`Warn`
    noIcon.log.error`Error`
    
    icon = logTest.assertModule.inDescendents(Icon)
    icon.log.info`Info`
    icon.log.warn`Warn`
    icon.log.error`Error`
})

it('fills log array', () => {  
    expect(logger.logs).toHaveLength(6)  
})

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