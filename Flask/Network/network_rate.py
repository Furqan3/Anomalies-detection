import json
def calculate_network_rates():
    network_data = []
    timestamps = []

    with open("network_data.json", 'r') as file:
        for line in file:
            data = json.loads(line)
            timestamps.append(data["timestamp"])
            network_data.append(data["network"])
    
    network_rates = {}
    for interface in network_data[0].keys():
        network_rates[interface] = {
            "bytes_sent_rate": [],
            "bytes_recv_rate": [],
            "packets_sent_rate": [],
            "packets_recv_rate": []
        }
        
        prev_stats = network_data[0][interface]
        
        for current_data in network_data[1:]:
            current_stats = current_data[interface]
            network_rates[interface]["bytes_sent_rate"].append(current_stats["bytes_sent"] - prev_stats["bytes_sent"])
            network_rates[interface]["bytes_recv_rate"].append(current_stats["bytes_recv"] - prev_stats["bytes_recv"])
            network_rates[interface]["packets_sent_rate"].append(current_stats["packets_sent"] - prev_stats["packets_sent"])
            network_rates[interface]["packets_recv_rate"].append(current_stats["packets_recv"] - prev_stats["packets_recv"])
            prev_stats = current_stats
    
    return network_rates