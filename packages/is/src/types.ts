/* eslint-disable
    @typescript-eslint/no-explicit-any  
*/

export type Constructor<T> = new (...args: any[]) => T

export type Falsy = null | undefined | false | 0 | ''