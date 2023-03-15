import Module from '../module'

//// Main ////

/**
 * Without a Logger module somewhere in the app, the 
 * Module's 'Log' method will not do anything.
 */
abstract class Logger extends Module {

}

//// Exports ////

export default Logger

export {
    Logger
}