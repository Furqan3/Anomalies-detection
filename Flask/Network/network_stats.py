# Function to get network statistics
import psutil
def get_network_stats():
    net_io = psutil.net_io_counters(pernic=True)
    network_stats = {}

    for interface, stats in net_io.items():
        network_stats[interface] = {
            "bytes_sent": stats.bytes_sent,
            "bytes_recv": stats.bytes_recv,
            "packets_sent": stats.packets_sent,
            "packets_recv": stats.packets_recv,
            "errin": stats.errin,
            "errout": stats.errout,
            "dropin": stats.dropin,
            "dropout": stats.dropout
        }
    
    return network_stats