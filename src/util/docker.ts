import Docker from 'dockerode'
import Dockerode, {Container} from 'dockerode'
import {config} from './config'
import {sleep} from "./util";
import * as dockerHandler from "./docker_handler"

const debug = require('debug')('azisaba-commander-api:docker')

const _nameDockerMap = new Map<string, Docker>();

export const init = async () => {
    if (!config['docker']) {
        debug("config have no docker setting")
        return
    }

    for (const key in config['docker']) {
        const value = config['docker'][key]
        debug(value)    //  print settings
        if (value['name'] === undefined) {
            debug('name undefined. skip')
            continue
        }

        //  identify connection type
        const protocol = value['protocol']
        if (!protocol) {
            debug('protocol undefined. skip %s', value['name'])
            continue
        }

        switch (protocol) {
            case 'unix': {  //  socket
                const socket = value['socket']
                if (!socket) {
                    debug('Socket path undefined.')
                    break
                }

                const docker = new Docker({
                    socketPath: socket
                })

                //  inspect and insert docker
                await inspectDockerode(value['name'], docker)
                break
            }

            case 'http': {
                const host = value['host']
                const port = value['port']
                if (!host || !port) {
                    debug('this protocol needs host and port.')
                    break
                }

                const docker = new Docker({
                    host: String(host),
                    port: Number(port)
                })

                //  inspect and insert docker
                await inspectDockerode(value['name'], docker)
                break
            }

            default: {
                debug('this protocol does not support. protocol: %s', protocol)
                break
            }
        }
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
const inspectDockerode = async (name: string, docker: Dockerode) => {
    try {
        //  todo after debug, pls set 6000
        await Promise.race([sleep(3000), docker.ping()]).then(result => {
            //  time-out
            if (!result) {
                debug('Error: %s is timed out', name)
            }

            if (String(result) === "OK") {
                debug('established connection to %s', name)
                //  insert
                _nameDockerMap.set(name, docker)
            } else {
                debug('Error: something wrong. name: %s', name)
            }
        })
    } catch (e) {
        debug('Error: occurred exception during ping pong. name: %s', name)
    }
}

// getter

/**
 * get Docker instance by name
 * @param name docker name
 * @return Docker|undefined
 */
export const getDocker = (name: string): Docker | undefined => {return _nameDockerMap.get(name)}

/**
 * Get all container
 *
 * @return Promise<Array<Container>>
 */
export const getAllContainer = async (): Promise<Array<Container>> => {
    const list = []

    for (const [name, node] of _nameDockerMap) {
        const nodeInfo = await node.info()
        const containers = await node.listContainers()
        for (const container of containers) {
            const containerInspection = await node.getContainer(container.Id).inspect();
            const containerStatus = dockerHandler.getStatus(container.Id)

            const formattedContainer: Container = {
                id: container.Id,
                //  @ts-ignore
                docker_id: nodeInfo.ID,
                name: name,
                created_at: containerInspection.Created,
                project_name: container.Labels['com.docker.compose.project'],
                service_name: container.Labels['com.docker.compose.service'],
                status: containerStatus
            }

            list.push(formattedContainer)
        }
    }

    return list
}

/**
 * Get a container
 *
 * @param nodeId
 * @param containerId
 * @return Promise<Container | undefined>
 */
export const getContainer = async (nodeId: string, containerId: string): Promise<Container | undefined> => {
    let name: string | undefined = undefined
    let node: Docker | undefined = undefined
    for (const [key, value] of _nameDockerMap.entries()) {
        const info = await value.info()
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
    const status = dockerHandler.getStatus(containerId)

    return {
        id: inspection.Id,
        //  @ts-ignore
        docker_id: nodeInfo.ID,
        name: name,
        created_at: inspection.Created,
        project_name: inspection.Config.Labels['com.docker.compose.project'],
        service_name: inspection.Config.Labels['com.docker.compose.service'],
        status: status
    }
}

/**
 * Stop a container
 *
 * @param nodeId
 * @param containerId
 * @return Promise<boolean>
 */
export const stopContainer = async (nodeId: string, containerId: string): Promise<boolean> => {
    const node = Array.from(_nameDockerMap.values()).find(async value => {
        const info = await value.info()
        return info.ID === nodeId
    })

    if (!node) {
        return false
    }

    const container = node.getContainer(containerId)
    await container.stop()
        .catch(() => {
            return false
        })
    return true
}

/**
 * Start a container
 *
 * @param nodeId
 * @param containerId
 * @return Promise<boolean>
 */
export const startContainer = async (nodeId: string, containerId: string): Promise<boolean> => {
    const node = Array.from(_nameDockerMap.values()).find(async value => {
        const info = await value.info()
        return info.ID === nodeId
    })

    if (!node) {
        return false
    }

    const container = node.getContainer(containerId)
    await container.start()
        .catch(() => {
            return false
        })
    return true
}