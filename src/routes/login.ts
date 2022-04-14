import express from "express";
import * as sql from "../util/sql";
import {SESSION_LENGTH, UNDER_REVIEW_TAG} from "../util/constants";
import * as crypto from "../util/crypto"
import {generateSecureRandomString, getIP, putSession, sleep, verify2FAToken} from "../util/util";

const debug = require('debug')('azisaba-commander-api:route:login')
export const router = express.Router();


/**
 * Login
 *
 * Request:
 * - username: string
 * - password: string
 * - 2fa_token: number *optional
 *
 * Response:
 * - state: string
 * Status*
 * - 200: Success
 * - 400: Failed
 */
router.post('/', async (req, res) => {
    //  check param
    if (!req.body || typeof req.body !== 'object') return res.status(400).send({error: 'invalid_params'})
    const username = req.body['username']
    const password = req.body['password']
    //  check null, length
    if (!username || !password || password.length < 7) return res.status(400).send({error: 'invalid_username_or_password'})
    //  get user
    const user = await sql.findOne('SELECT `id`, `password`, `group` FROM users WHERE `username`=? LIMIT 1', username)
    if (!user) return res.status(400).send({ error : 'invalid_username_or_password' })

    //  check if user has already verified
    if (user.group === UNDER_REVIEW_TAG) {
        return res.status(400).send({ error : 'incomplete_user'})
    }
    //  password
    if (!await crypto.compare(password, user.password) ){
        return res.status(400).send({ error : 'invalid_username_or_password' })
    }
    //  2fa
    if (!await verify2FAToken(user.id, req.body['2fa_token'])) {
        return res.status(400).send({ error : 'incorrect_2fa_token' })
    }

    //  issue Session
    await Promise.race([sleep(3000), generateSecureRandomString(50)]).then(async state => {
        if (!state) return res.status(408).send({ error: 'timed_out' })
        //  put
        await putSession({
            state,
            expires_at: Date.now() + SESSION_LENGTH,
            user_id: user.id,
            ip: getIP(req),
            pending: false
        })
        //  cookie
        res.cookie("azisabacommander_session", state)

        //  done
        res.status(200).send({
            state,
            message: 'logged_in'
        })
    });
})
