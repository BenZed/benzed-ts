import { HttpMethod } from '../../util'
import { Command } from './command'

//// Exports ////

export abstract class GetCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Get {
        return HttpMethod.Get
    }
}

export abstract class PostCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Post {
        return HttpMethod.Post
    }
}

export abstract class PatchCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Patch {
        return HttpMethod.Patch
    }
}

export abstract class PutCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Put {
        return HttpMethod.Put
    }
}

export abstract class DeleteCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Delete {
        return HttpMethod.Delete
    }
}

export abstract class OptionsCommand<I,O> extends Command<I,O> {
    get method(): HttpMethod.Options {
        return HttpMethod.Options
    }
}