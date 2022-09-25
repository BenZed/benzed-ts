
/*** Types ***/

interface Abort {
    (): void
}

/*** Main ***/

function onTimeout(
    callback: () => unknown,
    timeout: number
): Abort {

    const id = setTimeout(callback, timeout)

    return () => void clearTimeout(id)
}

function onInterval(
    callback: () => unknown,
    interval: number
): Abort {

    const id = setInterval(callback, interval)

    return () => void clearInterval(id)
}

function onAnimationFrame(
    callback: () => unknown
): Abort {

    if (typeof 'requestAnimationFrame' !== 'function') {
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

    return () => void (aborted = true)

}

/*** Exports ***/

export {
    onTimeout,
    onInterval,
    onAnimationFrame
}