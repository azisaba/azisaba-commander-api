import express from "express";
import {validateAndGetSession} from "../../util/util";
import * as sql from "../../util/sql";

const debug = require('debug')('azisaba-commander-api:route:v1:me')
export const router = express.Router();


/**
 * get user information
 *
 * Request:
 * - state: string
 */
router.get('/', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) return res.status(404).send({error: 'not_found'})
    const user = await sql.findOne("SELECT `id`, `username`, `group`, `last_update` FROM `users` WHERE `id` = ?", session.user_id)
    if (!user) return res.status(401).send({error: 'unauthorized'})
    //  todo return permission, and other profiles.
    res.status(200).send(user)
})
