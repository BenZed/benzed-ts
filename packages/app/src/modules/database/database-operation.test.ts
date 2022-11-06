import { Database } from './database'
import { Service } from '../../service'
import { DatabaseOperation } from './database-operation'

it('requires Database module on root', () => {

    expect(() => DatabaseOperation.create({ collection: 'any' })
        ._copyWithParent(Service.create())
        ._validateModules()
    ).toThrow(`${DatabaseOperation.name} requires Service to have module: ${Database.name}`)

})