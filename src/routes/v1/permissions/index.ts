import express from "express"
import * as userUtil from "../../../util/users"
import * as permissionUtil from "../../../util/permission"
import {validateAndGetSession} from "../../../util/util"

const debug = require('debug')('azisaba-commander-api:route:v1:permissions:index')

export const router = express.Router();

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