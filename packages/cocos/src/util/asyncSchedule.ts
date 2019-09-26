
const ONE_FRAME_DELAY = 0;

/***************************************************************/
// Async Schedule
/***************************************************************/

function asyncSchedule(
    component: cc.Component,
    delayOrMethod: number | Function = ONE_FRAME_DELAY
): Promise<unknown> {

    const argumentIsNumber = typeof delayOrMethod === 'number'

    const delay = argumentIsNumber
        ? delayOrMethod as number
        : ONE_FRAME_DELAY

    return new Promise(resolve => component.scheduleOnce(() => {

        const result = argumentIsNumber
            ? undefined
            : (delayOrMethod as Function)()

        if (result instanceof Promise)
            result.then(resolve)
        else
            resolve(result)

    }, delay))

}

/***************************************************************/
// Exports
/***************************************************************/

export default asyncSchedule