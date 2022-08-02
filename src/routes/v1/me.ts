import express from "express";
import {protect, validateAndGetSession} from "../../util/util";
import * as sql from "../../util/sql";
import * as userUtil from "../../util/users";
import * as twoFA from "../../util/2fa";

const debug = require('debug')('azisaba-commander-api:route:v1:me')
export const router = express.Router();


/**
 * get user information
 *
 * Request:
 * - state: string
 */
router.get('/', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) return res.status(401).send({error: 'unauthorized'})
    const user = await sql.findOne("SELECT `id`, `username`, `group`, `last_update` FROM `users` WHERE `id` = ?", session.user_id)
    if (!user) return res.status(401).send({error: 'unauthorized'})

    const permissions = await userUtil.getAllPermission(user.id)
    const is2Fa = await twoFA.isRegistered(user.id)

    res.status(200).send(
        {
            ...user,
            "permissions": permissions,
            "2fa": is2Fa
        }
    )
}))
