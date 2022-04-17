/**
 * SessionTable Type
 * Array<state, Session>
 */
declare type SessionTable = {
    [state: string]: Session
}

/**
 * Session Type
 * state: string
 * expires_at: number
 * user_id: number
 * ip: string
 * pending: boolean
 */
declare type Session = {
    state: string
    expires_at: number
    user_id: number
    ip: string
    pending: boolean
}

/**
 * Permission Type
 * id: permission id
 * name: permission name
 * content: list of permission content
 */
declare type Permission = {
    id: number
    name: string
    content: PermissionContent[]
}

/**
 * PermissionContent Type
 * project: docker-compose project
 * service: docker-compose service
 */
declare type PermissionContent = {
    project: string
    service: string
}

/**
 * Container Type
 * id: docker container id
 * docker_id: docker id
 *
 */
declare type Container = {
    id: string
    docker_id: string
    name: string
    created_at: string
    project_name: string
    service_name: string
    status: ContainerStatus
}

/**
 * ContainerStatus Type
 *
 */
declare type ContainerStatus = {
    state: object
    network_stats: object
    memory_stats: object
    cpu_stats: object
}