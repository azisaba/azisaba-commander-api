require('dotenv').config()
const debug = require('debug')('azisaba-commander-api:app')
import express from 'express'
import cors from 'cors'
import logger from 'morgan'
import * as sql from './util/sql'
import * as docker from './util/docker'

//  init module
sql.init()
    .then(async () => {
        //  TODO something

        await docker.init()
    })
    // @ts-ignore
    .then(() => process.emit('ready'))

export const app = express()

//  logger
app.use(logger('dev'))

//  cors setting
const corsOptions = {
    origin: process.env.APP_URL,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

//  json, url encoder
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

