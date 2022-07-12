import Docker, {Container} from 'dockerode'
import {config} from './config'
import {sleep} from "./util";
import Dockerode from "dockerode";
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
    const list = new Array<Container>()

    for (const [name, node] of _nameDockerMap) {
        const nodeInfo = await node.info()
        const containers = await node.listContainers()
        for (const container of containers) {
            const containerInspection = await node.getContainer(container.Id).inspect();
            const containerStats = await node.getContainer(container.Id).stats();
            const formattedContainer = {
                id: container.Id,
                docker_id: nodeInfo.ID,
                name: name,
                created_at: containerInspection.Created,
                project_name: container.Labels['com.docker.compose.project'],
                service_name: container.Labels['com.docker.compose.service'],
                status: {
                    state: {
                        state: container.State,
                        status: container.Status,
                        started_at: containerInspection.State.StartedAt,
                        finished_at: containerInspection.State.FinishedAt
                    },
                    network_state: {

                    },
                    memory_states: {},
                    cpu_states: {}
                }
            }
        }
    }
}