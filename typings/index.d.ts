/**
 *  SessionTable Type
 *  Array<state, Session>
 */
declare type SessionTable = {
    [state: string]: Session
}

/**
 *  Session Type
 *  state: string
 *  expires_at: number
 *  user_id: number
 *  ip: string
 *  pending: boolean
 */
declare type Session = {
    state: string
    expires_at: number
    user_id: number
    ip: string
    pending: int
}


/**
 *  User Type
 *  id: user id
 *  username: username
 *  group: group name
 */
declare type User = {
    id: number
    username: string
    group: string
}

/**
 *  Permission Type
 *  id: permission id
 *  name: permission name
 *  content: PermissionContent[]
 */
declare type Permission = {
    id: number
    name: string
    content: PermissionContent[]
}

/**
 *  Permission Content Type
 *
 *  Format rule
 *  project:service|project:service|...
 *
 *  project: docker-compose project
 *  service: docker-compose service
 */
declare type PermissionContent = {
    project: string
    service: string
}

/**
 *  Container Type
 *  id: docker container id
 *  docker_id: docker id
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
 *  ContainerStatus Type
 */
declare type ContainerStatus = {
    read_at: string
    state: {
        status: string,
        started_at: string,
        finished_at: string
    }
    network_stats: {
        tx_total_byte: number,
        tx_byte_per_sec: number,
        tx_total_packet: number,
        tx_packet_per_sec: number,
        rx_total_byte: number,
        rx_byte_per_sec: number,
        rx_total_packet: number,
        rx_packet_per_sec: number
    }
    memory_stats: {
        usage: number,
        limit: number,
        percent: number
    }
    cpu_stats: {
        percent: number
    }
}

/**
 *  ContainerLogs Type
 */
declare type ContainerLogs = {
    read_at: number
    logs: string
}

/**
 *  Type includes 2fa url and recovery keys
 */
declare type TwoFAContent = {
    id: number
    url: string
    recovery: string[]
}

/**
 *
 */
declare type LogGetterOption = {
    userId?: number,
    limit?: number
}

declare type Log = {
    userId?: number,
    message: string,
    date: string
}
