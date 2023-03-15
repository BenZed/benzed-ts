import Module from '../../module'
import { HttpMethod } from '../../util'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type Execute<I = any, O = any> = (input: I) => Promise<O> | O

export abstract class Executable<I,O> extends Module {

    abstract execute(input: I): Promise<O> | O

    abstract get method(): HttpMethod

}
