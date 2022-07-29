import express from "express";
import {deleteSession, getSessionKey, protect} from "../../util/util";

// const debug = require('debug')('azisaba-commander-api:route:v1:logout')
export const router = express.Router();


/**
 * Logout
 *
 * Request:
 * - state: string
 *
 * Response:
 *  Status:
 *  - 200: logged-out
 */
router.post('/', protect(async (req, res) => {
    const key = getSessionKey(req)
    if (key) await deleteSession(key)
    return res.status(200).send({ message: 'logged-out' })
}))
