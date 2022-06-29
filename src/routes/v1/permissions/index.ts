import express from "express"
import * as userUtil from "../../../util/users"
import * as permissionUtil from "../../../util/permission"
import {validateAndGetSession} from "../../../util/util"

const debug = require('debug')('azisaba-commander-api:route:v1:permissions:index')

export const router = express.Router();

/**
 * Get all permission
 * Require: Admin
 */
router.get('/', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    //  get all permission
    const permissions = permissionUtil.getAll()

    return res.status(200).send(
        {
            message: 'ok',
            permissions: permissions
        }
    )
})

/**
 * Get a permission
 * Require: Admin
 *
 * Parameter:
 * - id: permission id
 */
router.get('/:id', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    if (!req.params.id) {
        return res.status(400).send({ "error": "invalid_param" })
    }

    //  get all permission
    const permission = permissionUtil.get(+req.params.id)

    return res.status(200).send(
        {
            message: 'ok',
            permission: permission
        }
    )
})

/**
 * Create a permission
 * Require: Admin
 *
 * Body:
 * - name: string
 * - content: {
 *     - project: string
 *     - service: string
 * }
 */
router.post('/', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    //  param check
    if (!req.body || !req.body.name || !req.body.content) {
        return res.status(400).send({ error: 'invalid_param'})
    }

    const name = req.body.name
    const content = req.body.content
    const permission: Permission = {
        id: 0,
        name: name,
        content: content
    }

    const id = await permissionUtil.create(permission)
    if (!id) {
        return res.status(400).send({ error: 'invalid_request' })
    }

    return res.status(200).send({
        message: 'ok',
        id: id
    })
})

/**
 * Update a permission
 * Require: Admin
 *
 * Body:
 * - id: number
 * - name: string
 * - content: {
 *     - project: string
 *     - service: string
 * }
 */
router.patch('/', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    //  param check
    if (!req.body || !req.body.id ||!req.body.name || !req.body.content) {
        return res.status(400).send({ error: 'invalid_param'})
    }

    const permission: Permission = {
        id: +req.body.id,
        name: req.body.name,
        content: req.body.content
    }

    //  update
    await permissionUtil.update(permission)

    return res.status(200).send({
        message: 'ok',
        permission: await permissionUtil.get(permission.id)
    })
})


/**
 * Delete a permission
 * Require: Admin
 *
 * Body:
 * - id: number
 * }
 */
router.delete('/', async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!await userUtil.isAdmin(session.user_id)) {
        return res.status(403).send({ "error": "forbidden" })
    }
    //  param check
    if (!req.body || !req.body.id) {
        return res.status(400).send({ error: 'invalid_param'})
    }

    const id = req.body.id

    await permissionUtil.remove(id)

    if (await permissionUtil.exist(id)) {
        return res.status(400).send({ error: 'cannot_remove'})
    }

    return res.status(200).send({
        message: 'ok'
    })
})