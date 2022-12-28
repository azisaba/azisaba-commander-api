import express from "express"
import * as permissionUtil from "../../../util/permission"
import {authorizedAdminWithTwoFA} from "../../../util/util"

const debug = require('debug')('azisaba-commander-api:route:v1:permissions:index')

export const router = express.Router();

/**
 * Get all permission
 * Require: Admin
 */
router.get('/', authorizedAdminWithTwoFA(async (req, res) => {
    //  get all permission
    const permissions = await permissionUtil.getAll()

    return res.status(200).send(
        {
            message: 'ok',
            permissions: permissions
        }
    )
}))

/**
 * Get a permission
 * Require: Admin
 *
 * Parameter:
 * - id: permission id
 */
router.get('/:id', authorizedAdminWithTwoFA(async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({"error": "invalid_param"})
    }

    //  get permission
    const permission = await permissionUtil.get(+req.params.id)
    if (permission === null) {
        return res.status(404).send({"error": "not_found"})
    }

    return res.status(200).send(
        {
            message: 'ok',
            permission: permission
        }
    )
}))

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
router.post('/', authorizedAdminWithTwoFA(async (req, res) => {
    //  param check
    if (!req.body || !req.body.name || !req.body.content) {
        return res.status(400).send({error: 'invalid_param'})
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
        return res.status(400).send({error: 'invalid_request'})
    }

    return res.status(200).send({
        message: 'ok',
        id: id
    })
}))

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
router.patch('/', authorizedAdminWithTwoFA(async (req, res) => {
    //  param check
    if (!req.body || !req.body.id || !req.body.name || !req.body.content) {
        return res.status(400).send({error: 'invalid_param'})
    }

    const permission: Permission = {
        id: +req.body.id,
        name: req.body.name,
        content: req.body.content
    }

    if (!await permissionUtil.exist(permission.id)) {
        return res.status(404).send({"error": "not_found"})
    }

    //  update
    await permissionUtil.update(permission)

    return res.status(200).send({
        message: 'ok',
        permission: await permissionUtil.get(permission.id)
    })
}))


/**
 * Delete a permission
 * Require: Admin
 *
 * Body:
 * - id: number
 * }
 */
router.delete('/:id', authorizedAdminWithTwoFA(async (req, res) => {
    //  param check
    if (!req.params || !req.params.id) {
        return res.status(400).send({error: 'invalid_param'})
    }

    const id = req.params.id

    if (!await permissionUtil.exist(id)) {
        return res.status(404).send({"error": "not_found"})
    }

    await permissionUtil.remove(id)

    if (await permissionUtil.exist(id)) {
        return res.status(400).send({error: 'failed_remove'})
    }

    return res.status(200).send({
        message: 'ok'
    })
}))
