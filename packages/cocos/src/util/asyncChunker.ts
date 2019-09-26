
/***************************************************************/
// Constants
/***************************************************************/

const ONE_FRAME = 1 / 60 // ms
const UNIQUE_KEY_DIGITS = 6

/***************************************************************/
// Module State
/***************************************************************/

const timeStamps: { [key: string]: { start: number; last: number } } = {}
let uniqueId = 0

/***************************************************************/
// Helper
/***************************************************************/

const now: () => number = (() => {

    const hasPerformanceNow = 'peformance' in window && 'now' in window.performance
    if (hasPerformanceNow)
        return window.performance.now

    const start = Date.now()

    return () => Date.now() - start

})()

/***************************************************************/
// Main
/***************************************************************/

function uniqueKey(): string {
    let key = `${uniqueId++}`
    // I dunno if cocos polyfills for .padStart
    while (key.length < UNIQUE_KEY_DIGITS)
        key = '0' + key

    return key
}

function start(key: string): void {

    const ms = now()

    timeStamps[key] = {
        last: ms,
        start: ms
    }
}

function check(key: string, seconds = ONE_FRAME): boolean {

    if (CC_EDITOR && key in timeStamps === false)
        throw new Error(`${key} is not being tracked by the async-chunker`)

    const ms = now()
    const deltaMS = ms - timeStamps[key].last

    const overLimit = deltaMS >= seconds * 1000
    if (overLimit)
        timeStamps[key].last = ms

    return overLimit
}

function end(key: string, report = !CC_BUILD): void {

    if (report && key in timeStamps) {
        const totalS = (now() - timeStamps[key].start) / 1000
        cc.log(`${key} complete: ${totalS}s`)
    }

    delete timeStamps[key]
}

/***************************************************************/
// Exports
/***************************************************************/

export {
    uniqueKey,
    start,
    check,
    end
}