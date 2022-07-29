import express from "express";
import {protect, validateAndGetSession} from "../../../util/util";
import * as userUtil from "../../../util/users";

export const router = express.Router();

/**
 * Get a group which user belonging to
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.get('/', protect(async (req, res) => {
    //  @ts-ignore
    const userId = req.userId
    //  session
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    const user = await userUtil.getUser(userId);
    //  user exist
    if (!user) {
        return res.status(400).send({ "error": "invalid_user" })
    }

    return res.status(200).send(
        {
            "group": user.group
        }
    )
}))

/**
 * set user's group
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * Body:
 * - group: group name
 */
router.post('/', protect(async (req, res) => {
    //  @ts-ignore
    const userId = req.userId
    //  session
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    //  params
    if (!userId || !req.body || !req.body.group) {
        return res.status(400).send({ "error": "invalid_parameter" })
    }

    //  user exist
    if (!await userUtil.existUser(userId)) {
        return res.status(400).send({ "error": "invalid_user" })
    }

    await userUtil.setGroup(userId, req.body.group)

    return res.status(200).send(
        {
            "message": "ok"
        }
    )
}))