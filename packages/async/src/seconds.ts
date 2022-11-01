import milliseconds from './milliseconds'

/**
 * seconds - Wait for a the given number of seconds.
 *
 * @param {type} count Number of seconds to wait.
 */
const seconds = (count: number): Promise<void> =>
    milliseconds(count * 1000)

//// Main ////

export default seconds

export {
    seconds
}