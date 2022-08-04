import express from "express";
import {authorizedAdmin} from "../../util/util";
import * as logsUtil from "../../util/logs"

const debug = require('debug')('azisaba-commander-api:route:v1:logs')
export const router = express.Router();


/**
 * get logs
 *
 * Require: Admin
 */
router.get('/', authorizedAdmin(async (req, res) => {
    const option: LogGetterOption = {
        userId: +req.query.userId,
        limit: +req.query.limit
    }
    const result = await logsUtil.get(option)

    return res.status(200).send({
        logs: result
    })
}))
