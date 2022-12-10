import { Historical, HistoryScribe } from '@benzed/history-scribe'
import { HttpMethod } from '../../../util'
import { CommandHook } from '../command'

//// Main ////

function historyScribe<I extends Historical<I>>(
    method: HttpMethod.Put | HttpMethod.Patch | HttpMethod.Get | HttpMethod.Post
): CommandHook<Historical<I>, Historical<I>> {

    const scribe = new HistoryScribe<I>()

    return () => {
        
    }
}

//// Exports ////

export default historyScribe

export {
    historyScribe
}