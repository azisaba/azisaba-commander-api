import express from "express";
import * as sql from '../../util/sql'
import {
    verifyUnfinishedSession,
    generateSecureRandomString,
    getIP,
    getSession,
    putSession,
    sleep, protect
} from '../../util/util'
import * as crypto from "../../util/crypto"
import {UNDER_REVIEW_TAG, UNDER_REVIEW_SESSION_LENGTH, SessionStatus} from "../../util/constants";
import {commit} from "../../util/logs"

const debug = require('debug')('azisaba-commander-api:route:v1:register')
export const router = express.Router();

/**
 * Register an account
 *
 * Request:
 * - username: string
 * - password: string
 *
 * Response:
 *  - status: 200 success
 *  - status: 400
 *      description: something wrong
 */
router.post('/', protect(async (req, res) => {
    //  check param
    if (!req.body || typeof req.body !== 'object') return res.status(400).send({error: 'invalid_params'})
    const username = req.body['username']
    const password = req.body['password']

    //  check null, length
    if (!username || !password || password.length < 7) return res.status(400).send({error: 'invalid_username_or_password'})
    //  check if user or ip already exists
    if (await sql.findOne('SELECT `id` FROM users WHERE `username`=? OR `ip`=?', username, getIP(req))) {
        return res.status(400).send({ error: 'dupe_user' })
    }

    //  insert
    const user_id = await sql.findOne(
        'INSERT INTO `users` (`username`, `password`, `group`, `ip`) VALUES (?, ?, ?, ?)',
        username,
        await crypto.hash(password),
        UNDER_REVIEW_TAG,
        getIP(req)
    )   as number

    //  issue Session
    await Promise.race([sleep(3000), generateSecureRandomString(50)]).then(async state => {
        if (!state) return res.status(408).send({ error: 'timed_out' })
        //  put
        await putSession({
            state,
            expires_at: Date.now() + UNDER_REVIEW_SESSION_LENGTH,
            user_id: user_id,
            ip: getIP(req),
            pending: SessionStatus.UNDER_REVIEW
        })
        //  log
        const url = `${process.env.APP_URL}/register?state=${state}`
        debug(`New user requested review. user:${username} url:${url}`)
        await commit(user_id, `New user requested review. user:${username} url:${url}`)

        //  done
        res.status(200).send({ message: 'ok' })
    });
}))

/**
 * verify an account
 *
 * Request:
 * - id: string
 *
 * Response:
 * - state: string
 */
router.get('/:id', protect(async (req, res) => {
    const session = await getSession(String(req.params.id))
    if (!session || session.pending !== SessionStatus.UNDER_REVIEW) return res.status(403).send({ error: 'forbidden' })
    //  check group
    const user = await sql.findOne('SELECT `group`, `username` FROM `users` WHERE `id`=?', session.user_id)
    if (!user) return res.status(400).send({ error : 'forbidden' })
    if (user.group !== UNDER_REVIEW_TAG) return res.status(400).send({ error : 'dupe_user' })

    //  ip  check
    if (session.ip !== getIP(req)) return res.status(403).send({ error: 'forbidden' })

    //  accept request
    const result = await sql.query(
        'UPDATE `users` SET `group`=? WHERE `id`=?',
        'user',
        session.user_id
    )
    if (!result) return res.status(404).send( { error: 'not_found' })
    //  session
    const verified = await verifyUnfinishedSession(session.state)
    if (!verified) return res.status(404).send({ error: 'not_found' })
    if (verified.ip === '') return res.status(404).send({ error: 'not_found' })

    //  commit
    await commit(session.user_id, `${user.username} has been verified.`)
    return res.status(200).send({
        state: verified.state
    })
}))