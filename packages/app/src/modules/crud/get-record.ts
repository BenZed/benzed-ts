import $, { Infer } from "@benzed/schema"
import { Command } from "../../command"
import { CommandModule } from "../../module"
import { $logIcon } from "../../schemas"

/*** Types ***/

interface GetCommand<N extends string> extends Command {

    name: `get-${N}`

}

interface GetSettings<N extends string> extends _GetSettings {

    collection: N

}

type _GetSettings = Infer<typeof $getSetting>
const $getSetting = $({
    logIcon: $logIcon.default(`🗄️`),
    collection: $.string.asserts(name => name.startsWith(`get-`), `must start with "get-"`)
})

/*** Main ***/

class Get<N extends string> extends CommandModule<GetCommand<N>, { collection: N }> {

    static create<Nx extends string>(settings: GetSettings<Nx>): Get<Nx> {
        return new Get($getSetting.validate(settings)) as Get<Nx>
    }

    protected _execute(command: GetCommand<N>): object | Promise<object> {
        return {}
    }

    canExecute(command: Command): command is GetCommand<N> {
        return command.name === `get-${this.settings.collection}`
    }

}

/*** Exports ***/

export default Get 

export {
    Get
}