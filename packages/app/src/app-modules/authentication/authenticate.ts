import { fromBase64, isString, nil, toBase64 } from '@benzed/util'
import { $ } from '@benzed/schema'

import bcrypt from 'bcryptjs'

import { Command, CommandError } from '../command'
import { HttpCode } from '../../util'
import type { AccessToken, Authentication} from './authentication'

//// Each ////

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/

//// Types ////

type Credentials = {
    readonly email: string 
    readonly password: string
}

//// Schemas ////

const $credentials = $({
    email: $.string,
    password: $.string
})

//// Authenticate Command ////

type AuthenticateCommand = typeof authenticate

const authenticate = Command
    .put($credentials, async (credentials, ctx) => {

        const Auth = require('./authentication').Authentication as typeof Authentication

        const auth = ctx.node.assertModule.inSelf.or.inAncestors(Auth)

        const password = await auth.hashPassword(credentials.password)

        const { records } = await auth.collection.find({ email: credentials.email })

        const [ entity ] = records
        if (!entity || await bcrypt.compare(password, entity.password))
            throw new CommandError(HttpCode.Unauthorized, 'Invalid credentials.')

        const accessToken = await auth.createAccessToken({ _id: entity._id, })
        
        const output: AccessToken = { accessToken }
        return output
    })
    .setReq(req => req.addHeaderLink(
        (head, { email, password, ...rest }) => {
            const credentials = toBase64(`${email}:${password}`)
            head.set('authorization', `Basic ${credentials}`)
            return rest
        },
        (headers, data) => {

            const auth = headers?.get('authorization')
            if (!auth)
                return nil 
    
            const [email, password] = fromBase64(auth.replace('Basic ', ''))
                .split(':') 
            
            if (!isString(email) || !isString(password))
                return nil

            return { ...data, email, password }
        }
    ))

//// Exports ////

export {
    AuthenticateCommand,
    authenticate,

    Credentials,
    $credentials,

}