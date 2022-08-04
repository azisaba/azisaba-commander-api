import express from "express";
import {authorized} from "../../util/util";
import * as twoFA from "../../util/2fa";
import * as userUtil from "../../util/users";
import * as crypto from "../../util/crypto";
import * as sql from "../../util/sql";

const debug = require('debug')('azisaba-commander-api:route:v1:2fa')
export const router = express.Router();

/**
 * change password
 *
 * Body:
 * - old: old password
 * - new: new password
 * - code: 2fa code
 *
 * Response:
 * - 200: success
 * - 4xx: failed
 */
router.post('/', authorized(async (req, res, session) => {
    //  check param
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).send({error: "invalid_params"})
    }
    console.log(req.body)

    const oldPassword = req.body['old']
    const newPassword = req.body['new']
    const twoFaCode = req.body['code']
    //  check null, length
    if (!oldPassword || oldPassword.length < 7 || !newPassword || newPassword.length < 7) {
        return res.status(400).send({error: "invalid_username_or_password"})
    }
    const twoFARegistered = await twoFA.isRegistered(session.user_id);
    if (twoFARegistered && !twoFaCode) {
        return res.status(400).send({error: "invalid_2fa_code"})
    }

    const user = await sql.findOne(
        'SELECT `password` FROM `users` WHERE `id`=? LIMIT 1',
        session.user_id
    )
    if (!user) {
        return res.status(404).send({error: "user_not_found"})
    }

    //  password
    if (!await crypto.compare(oldPassword, user.password)) {
        return res.status(400).send({error: 'invalid_password_or_2fa_code'})
    }
    //  2fa
    if (!await twoFA.verify(session.user_id, twoFaCode)) {
        return res.status(400).send({error: "invalid_password_or_2fa_code"})
    }

    //  set new password
    await userUtil.changePassword(session.user_id, newPassword)

    return res.status(200).send({message: "ok"})
}))
