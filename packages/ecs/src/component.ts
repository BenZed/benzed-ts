
import { Entity } from './entity'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Component ***/

abstract class Component<I = any, O = any> extends Entity<I,O> {

}

/*** Exports ***/

export default Component

export {
    Component
}