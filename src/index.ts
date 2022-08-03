require('dotenv').config()
//  enable debug package
if (!process.env.DEBUG) {
    process.env.DEBUG = 'azisaba-commander-api:*'
}
import {app} from './app'
import http from 'http'

const debug = require('debug')('azisaba-commander-api:index')

const port = parseInt(process.env.PORT || '3000', 10);
app.set('port', port)
const server = http.createServer(app)

//  start server
process.once('ready', () => {
    server.listen(port)
    debug('listen at %d', port)
})