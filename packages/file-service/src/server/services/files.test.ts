import { createTestApp } from '../../../../feathers/src/util.test'
import configuration from '@feathersjs/configuration'

describe('File Service', () => {

    const app = createTestApp()
    const config = configuration()()

    const files = app.service('files')

    // beforeAll(() => app.listen(config.port))

})