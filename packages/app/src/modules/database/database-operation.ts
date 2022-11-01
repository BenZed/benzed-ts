import { unique } from '@benzed/immutable'
import $, { Infer } from '@benzed/schema'

import { command, Command } from '../../command'
import { SettingsModule } from '../../module'
import { Database } from './database'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-function-return-type
*/

//// Constants ////

const METHODS = ['get', 'create', 'update', 'find', 'remove'] as const

//// Settings ////

type Methods = Infer<typeof $method>
const $method = $.enum(...METHODS)
const $methods = $
    .array($method)
    .default([])
    .transforms(a => a.length === 0 ? METHODS : a)
    .validates(a => unique(a), 'Methods can only be registered once')
    .length('>', 0, 'Must have more than one method')

interface DatabaseOperationSettings extends Infer<typeof $databaseOperationSettings> {}
const $databaseOperationSettings = $({
    collection: $.string
})

//// Command Helpers ////

const ifMethodCommand = <M extends readonly Methods[], Mx extends Methods, C extends Command<any,any,any>>(
    methods: M, 
    method: Mx, 
    command: C
): Mx extends M ? C : void => 
    (methods.includes(method) ? command : undefined) as Mx extends M ? C : void

const getCollection = (databaseOp: DatabaseOperation<any>) => 
    databaseOp
        .database
        .getCollection(databaseOp.settings.collection)

const getCommand = (databaseOp: DatabaseOperation<any>) => 
    command((data: { id: string }) => getCollection(databaseOp)
        .get(data.id)
        .then(record => ({ record }))  
    )

const findCommand = (databaseOp: DatabaseOperation<any>) => 
    command((data: { id: string }) => getCollection(databaseOp)
        .get(data.id)
        .then(record => ({ record }))  
    )

const createCommand = (databaseOp: DatabaseOperation<any>) => 
    command((data: { id: string }) => getCollection(databaseOp)
        .get(data.id)
        .then(record => ({ record }))  
    )

const removeCommand = (databaseOp: DatabaseOperation<any>) => 
    command((data: { id: string }) => getCollection(databaseOp)
        .get(data.id)
        .then(record => ({ record }))  
    )

const updateCommand = (databaseOp: DatabaseOperation<any>) => 
    command((data: { id: string }) => getCollection(databaseOp)
        .get(data.id)
        .then(record => ({ record }))  
    )

//// Database Operation ////

class DatabaseOperation<M extends Methods> extends SettingsModule<DatabaseOperationSettings> {

    //// Sealed Construction ////
    
    static create <Mx extends Methods>(
        settings: DatabaseOperationSettings,
        ...methods: readonly Mx[]
    ): DatabaseOperation<Mx> {
        return new DatabaseOperation(
            $databaseOperationSettings.validate(settings),
            $methods.validate(methods) as readonly Mx[]
        )
    }

    get database(): Database {
        return this.root.getModule(Database, true)
    }

    private constructor(
        settings: DatabaseOperationSettings,
        readonly methods: readonly M[]
    ) {
        super(settings)

        this.get = ifMethodCommand(methods, 'get', getCommand(this)) as any
        this.find = ifMethodCommand(methods, 'find', findCommand(this)) as any
        this.create = ifMethodCommand(methods, 'create', createCommand(this)) as any
        this.remove = ifMethodCommand(methods, 'remove', removeCommand(this)) as any
        this.update = ifMethodCommand(methods, 'update', updateCommand(this)) as any
    
    }

    //// Commands ////

    get: 'get' extends M ? ReturnType<typeof getCommand> : void
    find: 'find' extends M ? ReturnType<typeof findCommand> : void
    create: 'create' extends M ? ReturnType<typeof createCommand> : void
    remove: 'remove' extends M ? ReturnType<typeof removeCommand> : void
    update: 'update' extends M ? ReturnType<typeof updateCommand> : void

    //// Module Interface ////
    
    override _validateModules(): void {
        this._assertRootRequired(Database)
        this._assertSingle()
    }

    protected override get _copyParams(): unknown[] {
        return [this.settings, this.methods]
    }

}

//// Exports ////

export default DatabaseOperation 

export {
    DatabaseOperation,
    DatabaseOperationSettings,
    $databaseOperationSettings
}