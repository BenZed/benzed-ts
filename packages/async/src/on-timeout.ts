
//// Types ////

interface Abort {
    (): void
}

//// Main ////

function onTimeout(
    callback: () => unknown,
    timeout: number
): Abort {

    const id = setTimeout(callback, timeout)

    const abort: Abort = () => void clearTimeout(id)
    return abort
}

function onInterval(
    callback: () => unknown,
    interval: number
): Abort {

    const id = setInterval(callback, interval)

    const abort: Abort = () => void clearInterval(id)
    return abort
}

function onAnimationFrame(
    callback: () => unknown
): Abort {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestAnimationFrame = (globalThis as any).requestAnimationFrame

    if (typeof requestAnimationFrame !== 'function') {
        const SIXTY_FRAMES_PER_SECOND = 1000 / 60
        return onInterval(callback, SIXTY_FRAMES_PER_SECOND)
    }

    let aborted = false

    const abortableCallback = (): void => {
        callback()
        if (!aborted)
            requestAnimationFrame(abortableCallback)
    }

    requestAnimationFrame(abortableCallback)

    const abort: Abort = () => void (aborted = true)
    return abort
}

//// Exports ////

export {
    onTimeout,
    onInterval,
    onAnimationFrame
}