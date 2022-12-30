import Docker from 'dockerode'
import {config} from './config'
import {sleep} from "./util";
import * as dockerHandler from "./docker_handler"
import fs from "fs";

const debug = require('debug')('azisaba-commander-api:docker')

const _nameDockerMap = new Map<string, Docker>();

export const init = async () => {
    if (!config['docker']) {
        debug("config have no docker setting")
        return
    }

    for (const key in config['docker']) {
        const value = config['docker'][key]
        const {name, ...data} = value

        debug(value)    //  print settings
        if (value['name'] === undefined) {
            debug('name undefined. skip')
            continue
        }

        let formatted = data
        if (formatted.ca) {
            formatted.ca = fs.readFileSync(formatted.ca)
        }
        if (formatted.cert) {
            formatted.cert = fs.readFileSync(formatted.cert)
        }
        if (formatted.key) {
            formatted.key = fs.readFileSync(formatted.key)
        }

        const docker = new Docker(formatted)

        //  inspect and insert docker
        await inspectDockerode(value['name'], docker)
    }

    //  init handler
    dockerHandler.init(Array.from(_nameDockerMap.values()))
}

/**
 * Inspect docker instance with ping-pong. inset it into internal map if pass inspection.
 *
 * @param name
 * @param docker
 */
const inspectDockerode = async (name: string, docker: Docker) => {
    try {
        await Promise.race([sleep(5000), docker.ping()]).then(result => {
            //  time-out
            if (!result) {
                debug('Error: %s is timed out', name)
            }

            if (String(result) === "OK") {
                debug('established connection to %s', name)
                //  insert
                _nameDockerMap.set(name, docker)
            } else {
                debug('Error: something wrong. name: %s\n%s', name, result)
            }
        })
    } catch (e) {
        debug('Error: occurred exception during ping pong. name: %s\n%s', name, e)
    }
}

/**
 * Get all container
 *
 * @return Promise<Array<Container>>
 */
export const getAllContainer = async (): Promise<Array<Container>> => {
    const list = []

    for (const [name, node] of _nameDockerMap) {
        try {
            const nodeInfo = await Promise.race([sleep(1000), node.info()])
            if (!nodeInfo) {
                continue
            }
            const containers = await node.listContainers({
                all: true
            })
            for (const container of containers) {
                const containerInspection = await node.getContainer(container.Id).inspect();
                const containerStatus = dockerHandler.getStatus(container.Id)

                const formattedContainer: Container = {
                    id: container.Id,
                    name: containerInspection.Name,
                    //  @ts-ignore
                    docker_id: nodeInfo.ID,
                    docker_name: name,
                    created_at: containerInspection.Created,
                    project_name: container.Labels['com.docker.compose.project'],
                    service_name: container.Labels['com.docker.compose.service'],
                    // @ts-ignore
                    status: containerStatus
                }

                list.push(formattedContainer)
            }
        } catch (e) {
        }
    }

    return list
}

/**
 * Get a container
 *
 * @param nodeId docker node id
 * @param containerId container id
 * @return Promise<Container | undefined>
 */
export const getContainer = async (nodeId: string, containerId: string): Promise<Container | undefined> => {
    let name: string | undefined = undefined
    let node: Docker | undefined = undefined
    for (const [key, value] of _nameDockerMap.entries()) {
        const info = await Promise.race([sleep(1000), value.info()])
        if (!info) {
            continue
        }

        if (info.ID === nodeId) {
            name = key
            node = value
            break
        }
    }
    if (!name || !node) {
        return undefined
    }

    //  container
    const container = node.getContainer(containerId)
    const inspection = await container.inspect().catch(() => undefined);
    if (!inspection) {
        return undefined
    }
    const status = dockerHandler.getStatus(inspection.Id)

    return {
        id: inspection.Id,
        name: inspection.Name,
        docker_id: nodeId,
        docker_name: name,
        created_at: inspection.Created,
        project_name: inspection.Config.Labels['com.docker.compose.project'],
        service_name: inspection.Config.Labels['com.docker.compose.service'],
        //  @ts-ignore
        status: status
    }
}

/**
 * Stop a container
 *
 * @param nodeId docker node id
 * @param containerId container id
 * @return Promise<boolean> if process is succeed, return true
 */
export const stopContainer = async (nodeId: string, containerId: string): Promise<boolean> => {
    try {
        const node = await getNode(nodeId)
        if (!node) {
            return false
        }

        const container = node.getContainer(containerId)
        //  check if container exists
        const inspection = await container.inspect().catch(() => undefined);
        if (!inspection) {
            return false
        }

        await container.stop()
            .catch(reason => {
                return reason.statusCode === 304;
            })
        return true
    } catch (e) {
        return false
    }
}

/**
 * Start a container
 *
 * @param nodeId docker node id
 * @param containerId container id
 * @return Promise<boolean> if process is succeed, return true
 */
export const startContainer = async (nodeId: string, containerId: string): Promise<boolean> => {
    try {
        const node = await getNode(nodeId)
        if (!node) {
            return false
        }

        const container = node.getContainer(containerId)
        //  check if container exists
        const inspection = await container.inspect().catch(() => undefined);
        if (!inspection) {
            return false
        }

        await container.start()
            .catch(reason => {
                return reason.statusCode === 304;
            })
        return true
    } catch (e) {
        return false
    }
}

/**
 * Restart a container
 *
 * @param nodeId docker node id
 * @param containerId container id
 * @return Promise<boolean> if process is succeed, return true
 */
export const restartContainer = async (nodeId: string, containerId: string): Promise<boolean> => {
    return await stopContainer(nodeId, containerId) && await startContainer(nodeId, containerId)
}

/**
 * Get container's logs
 *
 * @param nodeId docker node id
 * @param containerId container id
 */
export const getLogs = async (nodeId: string, containerId: string): Promise<ContainerLogs | undefined> => {
    try {
        const node = await getNode(nodeId)
        if (!node) {
            return undefined
        }

        const container = node.getContainer(containerId)
        //  check if container exists
        const inspection = await container.inspect().catch(() => undefined);
        if (!inspection) {
            return undefined
        }

        const logs = await container.logs({
            follow: false,
            stdout: true,
            stderr: true,
            tail: 1000
        })

        if (!Buffer.isBuffer(logs)) {
            return undefined
        }

        return {
            read_at: new Date().getDate(),
            logs: logs.toString("utf-8")
        }
    } catch (e) {
        return undefined
    }
}

const getNode = async (nodeId: string): Promise<Docker | undefined> => {
    for (const value of Array.from(_nameDockerMap.values())) {
        const info = await Promise.race([sleep(1000), value.info()])
        if (!info) {
            continue
        }

        if (info.ID == nodeId) {
            return value
        }
    }
    return undefined
}