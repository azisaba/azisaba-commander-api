import fs from 'fs'

const debug = require('debug')('azisaba-commander-api:config')

const CONFIG_PATH = process.env.CONFIG_PATH
//  throw error if Path is undefined
if (!CONFIG_PATH) {
    debug('config path is undefined')
    throw Error('config path is undefined.')
}

//  check config file exists
if (!fs.existsSync(CONFIG_PATH)) {
    debug("config doesn't exist")
    throw Error("config doesn't exist")
}

export const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
