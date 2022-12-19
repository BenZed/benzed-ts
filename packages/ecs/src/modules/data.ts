import { Module } from '../module'

/**
 * I'm going to use this a lot.
 */
export class Data<T> extends Module<T> {

    setData<Tx>(data: Tx): Data<Tx>{
        return new Data(data)
    }

    getData(): T {
        return this.data
    }

}
