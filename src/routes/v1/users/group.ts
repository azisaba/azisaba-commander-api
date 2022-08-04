import express from "express";
import {authorizedAdmin} from "../../../util/util";
import * as userUtil from "../../../util/users";
import {commit} from "../../../util/logs";

export const router = express.Router();

/**
 * Get a group which user belonging to
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 */
router.get('/', authorizedAdmin(async (req, res) => {
    //  @ts-ignore
    const userId = req.userId

    const user = await userUtil.getUser(userId);
    //  user exist
    if (!user) {
        return res.status(400).send({"error": "invalid_user"})
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
router.post('/', authorizedAdmin(async (req, res, session) => {
    //  @ts-ignore
    const userId = req.userId

    //  params
    if (!userId || !req.body || !req.body.group) {
        return res.status(400).send({"error": "invalid_parameter"})
    }

    //  user exist
    if (!await userUtil.existUser(userId)) {
        return res.status(400).send({"error": "invalid_user"})
    }

    await userUtil.setGroup(userId, req.body.group)

    //  log
    await commit(session.user_id, `set ${userId}'s group as ${req.body.group}`)

    return res.status(200).send(
        {
            "message": "ok"
        }
    )
}))