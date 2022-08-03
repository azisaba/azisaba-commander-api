import express from "express"
import {protect, validateAndGetSession} from "../../../util/util";
import * as userUtil from "../../../util/users";
import * as permissionUtil from "../../../util/permission";
import {commit} from "../../../util/logs";

const debug = require('debug')('azisaba-commander-api:route:v1:users:permissions')

export const router = express.Router();

/**
 * Get a list of user permissions
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
        return res.status(401).send({"error": "not_authorized"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({"error": "forbidden"})
    }
    //  param check
    if (!userId) {
        return res.status(400).send({"error": "invalid_params"})
    }

    //  get all permission
    const permissions = await userUtil.getAllPermission(userId)
    if (!permissions) {
        return res.status(404).send({"error": "not_found"})
    }

    return res.status(200).send(
        {
            "message": "ok",
            "userId": userId,
            "permissions": permissions
        }
    )
}))

/**
 * add a permission
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * - permission_id: permission id
 */
router.post('/:permission_id', protect(async (req, res) => {
    //  @ts-ignore
    const userId = req.userId
    const permissionId = req.params.permission_id
    //  session
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({"error": "not_authorized"})
    }
    //  param check
    if (!userId || !permissionId) {
        return res.status(400).send({"error": "invalid_params"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({"error": "forbidden"})
    }

    //  user exist
    if (!await userUtil.existUser(userId)) {
        return res.status(400).send({"error": "invalid_user"})
    }
    //  permission exist
    if (!await permissionUtil.exist(+permissionId)) {
        return res.status(400).send({"error": "invalid_permission"})
    }

    //  check if user has permission
    if (await userUtil.hasPermission(userId, +permissionId)) {
        return res.status(400).send({"error": "user_already_has"})
    }

    //  add permission
    await userUtil.addPermission(userId, +permissionId)

    //  check if user has permission
    if (!await userUtil.hasPermission(userId, +permissionId)) {
        return res.status(500).send({"error": "something went wrong"})
    }

    //  log
    await commit(session.user_id, `give permission ${permissionId} to ${userId}`)

    return res.status(200).send({"message": "ok"})
}))

/**
 * delete a permission from user
 * Require group: admin
 *
 * Parameters:
 * - id: user id
 * - permission_id: permission id
 */
router.delete('/:permission_id', protect(async (req, res) => {
    //  @ts-ignore
    const userId = req.userId
    const permissionId = req.params.permission_id
    //  session
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({"error": "not_authorized"})
    }
    //  param check
    if (!userId || !permissionId) {
        return res.status(400).send({"error": "invalid_params"})
    }
    //  permission check
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({"error": "forbidden"})
    }

    //  user exist
    if (!await userUtil.existUser(userId)) {
        return res.status(400).send({"error": "invalid_user"})
    }

    //  check if user has permission
    if (!await userUtil.hasPermission(userId, +permissionId)) {
        return res.status(404).send({"error": "user_not_has"})
    }

    //  add permission
    await userUtil.removePermission(userId, +permissionId)

    //  check if user has permission
    if (await userUtil.hasPermission(userId, +permissionId)) {
        return res.status(500).send({"error": "something went wrong"})
    }

    //  log
    await commit(session.user_id, `remove permission ${permissionId} from ${userId}`)

    return res.status(200).send({"message": "ok"})
}))