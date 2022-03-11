import Docker from 'dockerode'
import {config} from './config'
const debug = require('debug')('azisaba-commander-api:docker')

const _nameDockerMap = new Map<string, Docker>();

/**
 * get map of docker instances
 * @return Map<string, Dockerode>
 */
export const dockerMap = (): Map<string, Docker> => {return _nameDockerMap}

/**
 * get Dockerode instance by name
 * @param name docker name
 * @return Dockerode|undefined
 */
export const getDocker = (name: string): Docker | undefined => {return _nameDockerMap.get(name)}

export const init = async () => {
    if (!config['docker']) {
        debug("config have no docker setting")
        return
    }

    //  connection test and insert it
    const insertDocker = async (name: string, docker: Docker): Promise<void> => {
        try {
            const res = await docker.ping()
            if (String(res) === "OK") {
                debug('established connection to %s', name)
                //  insert
                _nameDockerMap.set(name, docker)
            } else {
                debug('Error: something wrong. name: %s', name)
            }
        } catch (e) {
            debug('Error: occurred exception during ping pong.')
        }
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
                await insertDocker(value['name'], docker)
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
                await insertDocker(value['name'], docker)
                break
            }

            default: {
                debug('this protocol does not support. protocol: %s', protocol)
                break
            }
        }
    }
}