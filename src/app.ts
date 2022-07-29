require('dotenv').config()
const debug = require('debug')('azisaba-commander-api:app')
import express from 'express'
import {generateSaltRounds} from "./util/crypto";
import cors from 'cors'
import logger from 'morgan'
import * as sql from './util/sql'
import * as docker from './util/docker'
import cookieParser from "cookie-parser";
import {getIP} from "./util/util";

//  router: v1
import {router as indexV1Router} from "./routes/v1";

//  init module
sql.init()
    .then(async () => {
        //  generate salt
        const rounds = await generateSaltRounds()
        debug('Generated salt rounds: %d', rounds)

        //  init docker loader
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
app.use(cookieParser())

//  todo create not found direction

//  API Request rate limit
let apiRequests: { [ip: string]: number } = {}
app.use('/api', (req, res, next) => {
    const limit = 1000
    const ip = getIP(req)
    if (apiRequests[ip] >= limit) return res.status(429).send({ error: 'too_many_requests' })
    apiRequests[ip] = (apiRequests[ip] || 0) + 1
    next()
})

//  router
app.use('/', indexV1Router)