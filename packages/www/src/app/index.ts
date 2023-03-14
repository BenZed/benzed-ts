import { App } from '@benzed/app'

//// App //// 

class BenZedWWW extends App {
 
}

//// Execute ////

const website = new BenZedWWW

//// Exports ////

export const server = website.asServer()

export const client = website.asClient()