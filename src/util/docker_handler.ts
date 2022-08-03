import Docker from 'dockerode'

const debug = require('debug')('azisaba-commander-api:docker_handler')

const _nodes = new Array<Docker>()
const _container_statuses = new Map<string, ContainerStatus>()

export const init = (nodes: Array<Docker>, interval: number = 5000) => {
    //  containing
    for (const node of nodes) {
        _nodes.push(node)
    }

    //  start handler
    setInterval(statusHandler, interval)
}

const statusHandler = async () => {
    for (const node of _nodes) {
        const containers = await node.listContainers()
        for (const container of containers) {
            const stats = await node.getContainer(container.Id).stats({stream: false});
            const inspection = await node.getContainer(container.Id).inspect()

            //  null check
            if (!stats || !inspection) continue

            //  previous read data
            const oldStatus = _container_statuses.get(container.Id)

            //  networks
            let total_byte_tx = 0
            let total_byte_rx = 0
            let total_packet_tx = 0;
            let total_packet_rx = 0;
            if (!stats.networks) {
                continue
            }
            for (const [, network] of Object.entries(stats.networks)) {
                total_byte_tx += network.tx_bytes
                total_byte_rx += network.rx_bytes
                total_packet_tx += network.tx_packets
                total_packet_rx += network.rx_packets
            }
            //  calculate
            let tx_byte_rate = 0;
            let rx_byte_rate = 0;
            let tx_packet_rate = 0;
            let rx_packet_rate = 0;
            if (oldStatus) {
                const oldData = new Date(oldStatus.read_at)
                const nowDate = new Date(stats.read)
                const delta_second = (nowDate.getTime() - oldData.getTime()) / 1000;
                tx_byte_rate = (total_byte_tx - oldStatus.network_stats.tx_total_byte) / delta_second;
                rx_byte_rate = (total_byte_rx - oldStatus.network_stats.rx_total_byte) / delta_second;
                tx_packet_rate = (total_packet_tx - oldStatus.network_stats.tx_total_packet) / delta_second;
                rx_packet_rate = (total_packet_rx - oldStatus.network_stats.rx_total_packet) / delta_second;
            }

            //  memory
            const memory_percent = (stats.memory_stats.usage / stats.memory_stats.limit) * 100

            //  cpu
            const cpu_delta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
            const cpu_system_delta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
            const cpu_percent = (cpu_delta / cpu_system_delta) * 100

            const status: ContainerStatus = {
                read_at: stats.read,
                state: {
                    status: inspection.State.Status,
                    started_at: inspection.State.StartedAt,
                    finished_at: inspection.State.FinishedAt
                },
                network_stats: {
                    tx_total_byte: total_byte_tx,
                    tx_byte_per_sec: tx_byte_rate,
                    tx_total_packet: total_packet_tx,
                    tx_packet_per_sec: tx_packet_rate,
                    rx_total_byte: total_byte_rx,
                    rx_byte_per_sec: rx_byte_rate,
                    rx_total_packet: total_packet_rx,
                    rx_packet_per_sec: rx_packet_rate
                },
                memory_stats: {
                    usage: stats.memory_stats.usage,
                    limit: stats.memory_stats.limit,
                    percent: memory_percent
                },
                cpu_stats: {
                    percent: cpu_percent
                }
            }

            //  push
            _container_statuses.set(container.Id, status)
        }
    }
}

export const getStatus = (id: string): ContainerStatus | undefined => {
    return _container_statuses.get(id)
}
