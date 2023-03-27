import { HttpMethod } from '../../util'
import { Command } from './command'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Exports ////

export abstract class GetCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Get {
        return HttpMethod.Get
    }
}

export abstract class PostCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Post {
        return HttpMethod.Post
    }
}

export abstract class PatchCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Patch {
        return HttpMethod.Patch
    }
}

export abstract class PutCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Put {
        return HttpMethod.Put
    }
}

export abstract class DeleteCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Delete {
        return HttpMethod.Delete
    }
}

export abstract class OptionsCommand<I = any,O = any> extends Command<I,O> {
    override get method(): HttpMethod.Options {
        return HttpMethod.Options
    }
}

/*
type Stream = string | Buffer | Readable 

// Generic Command for getting static files serverside
export class GetStaticFile extends GetCommand<string, Stream> { ... }

// Command for getting html files that are going to be augmented with serverside markup
// TODO move to @benzed/react?
export class GetReactViewFile extends GetStaticFile { ... }
*/