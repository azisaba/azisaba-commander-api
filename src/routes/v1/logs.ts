import express from "express";
import {protect, validateAndGetSession} from "../../util/util";
import * as userUtil from "../../util/users";
import * as logsUtil from "../../util/logs"

const debug = require('debug')('azisaba-commander-api:route:v1:logs')
export const router = express.Router();


/**
 * get logs
 *
 * Require: Admin
 */
router.get('/', protect(async (req, res) => {
    //  session
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({"error": "not_authorized"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({"error": "forbidden"})
    }

    const option: LogGetterOption = {
        userId: +req.query.userId,
        limit: +req.query.limit
    }
    const result = await logsUtil.get(option)

    return res.status(200).send({
        logs: result
    })
}))
