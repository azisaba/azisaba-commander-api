import express from "express"
import * as userUtil from "../../../util/users"
import * as docker from "../../../util/docker"
import {protect, validateAndGetSession} from "../../../util/util"
import {commit} from "../../../util/logs";

const debug = require('debug')('azisaba-commander-api:route:v1:container:index')

export const router = express.Router();

/**
 * Get all container
 */
router.get('/', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }

    const containers = await docker.getAllContainer()
    let filteredContainers: Container[]
    if (await userUtil.isAdmin(session.user_id)) {
        filteredContainers = containers
    } else {
        //  get containers that user has its permission
        filteredContainers = containers.filter(async value => {
            return await userUtil.hasPermissionContent(
                session.user_id,
                {
                    project: value.project_name,
                    service: value.service_name
                }
            )
        })
    }

    return res.status(200).send({
        containers: filteredContainers
    })
}))

/**
 * Get a container
 */
router.get('/:nodeId/:containerId', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!req.params || !req.params.nodeId || !req.params.containerId) {
        return res.status(400).send({ "error": "invalid_params" })
    }

    const container = await docker.getContainer(req.params.nodeId, req.params.containerId)
    if (!container) {
        return res.status(404).send({ "error": "container_not_found" })
    }
    //  permission
    if (!await checkContainerPermission(session.user_id, container)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    return res.status(200).send(container)
}))

/**
 * Start a container
 */
router.post('/:nodeId/:containerId/start', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!req.params || !req.params.nodeId || !req.params.containerId) {
        return res.status(400).send({ "error": "invalid_params" })
    }

    const container = await docker.getContainer(req.params.nodeId, req.params.containerId)
    if (!container) {
        return res.status(404).send({ "error": "container_not_found" })
    }
    //  permission
    if (!await checkContainerPermission(session.user_id, container)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    //  stop
    const result = await docker.startContainer(req.params.nodeId, req.params.containerId)

    if (!result) {
        return res.status(304).send( { "message": "container is already started" })
    }

    //  log
    await commit(session.user_id, `Start a container. ${container.project_name}:${container.service_name}`)

    return res.status(200).send({ "message": "started" })
}))


/**
 * Stop a container
 */
router.post('/:nodeId/:containerId/stop', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!req.params || !req.params.nodeId || !req.params.containerId) {
        return res.status(400).send({ "error": "invalid_params" })
    }

    const container = await docker.getContainer(req.params.nodeId, req.params.containerId)
    if (!container) {
        return res.status(404).send({ "error": "container_not_found" })
    }
    //  permission
    if (!await checkContainerPermission(session.user_id, container)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    //  stop
    const result = await docker.stopContainer(req.params.nodeId, req.params.containerId)

    if (!result) {
        return res.status(304).send( { "message": "container is already stopped" })
    }

    //  log
    await commit(session.user_id, `Stop a container. ${container.project_name}:${container.service_name}`)

    return res.status(200).send({ "message": "stopped" })
}))

/**
 * Restart a container
 */
router.post('/:nodeId/:containerId/restart', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!req.params || !req.params.nodeId || !req.params.containerId) {
        return res.status(400).send({ "error": "invalid_params" })
    }

    const container = await docker.getContainer(req.params.nodeId, req.params.containerId)
    if (!container) {
        return res.status(404).send({ "error": "container_not_found" })
    }
    //  permission
    if (!await checkContainerPermission(session.user_id, container)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    //  stop
    const result = await docker.restartContainer(req.params.nodeId, req.params.containerId)

    if (!result) {
        return res.status(500).send( { "message": "something went wrong" })
    }

    //  log
    await commit(session.user_id, `Restart a container. ${container.project_name}:${container.service_name}`)

    return res.status(200).send({ "message": "restarted" })
}))

/**
 * Get a container logs
 */
router.get('/:nodeId/:containerId/logs', protect(async (req, res) => {
    const session = await validateAndGetSession(req)
    if (!session) {
        return res.status(401).send({ "error": "not_authorized"})
    }
    if (!req.params || !req.params.nodeId || !req.params.containerId) {
        return res.status(400).send({ "error": "invalid_params" })
    }

    const container = await docker.getContainer(req.params.nodeId, req.params.containerId)
    if (!container) {
        return res.status(404).send({ "error": "container_not_found" })
    }
    //  permission
    if (!await checkContainerPermission(session.user_id, container)) {
        return res.status(403).send({ "error": "forbidden" })
    }

    let time = 0
    if (!req.body || !req.body.since) {
        time = +req.body.since
    }

    const logs = await docker.getLogs(
        container.docker_id,
        container.id,
        time
        )

    return res.status(200).send(logs)
}))

/**
 * check if user have permission of target container
 * @param user_id
 * @param container
 */
const checkContainerPermission = async (user_id: number,container: Container): Promise<boolean> => {
    return await userUtil.isAdmin(user_id)  ||
        await userUtil.hasPermissionContent(
            user_id,
            {
                project: container.project_name,
                service: container.service_name
            })
}
