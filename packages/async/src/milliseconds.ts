/**
* milliseconds - Wait for the given number of milliseconds.
*
* @param {type} count Number of milliseconds to wait.
*/
const milliseconds = (count: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, count))

/*** Exports ***/

export default milliseconds

export {
    milliseconds
}