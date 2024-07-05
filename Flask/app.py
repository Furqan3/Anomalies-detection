from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import numpy as np
from sklearn.ensemble import IsolationForest
import time

from Network.network_stats import get_network_stats
from Network.statistical_methods import calculate_mean_std
from Network.statistical_methods import calculate_z_scores
from Network.statistical_methods import detect_anomalies
from Network.statistical_methods import get_process_info_by_pid

app = Flask(__name__)
CORS(app)

# ... (include your existing functions here: get_network_stats, calculate_mean_std, 
#      calculate_z_scores, detect_anomalies, get_process_info_by_pid)

def isolation_forest_anomaly_detection(data, contamination=0.1):
    X = np.array(data).reshape(-1, 1)
    clf = IsolationForest(contamination=contamination, random_state=42)
    clf.fit(X)
    y_pred = clf.predict(X)
    anomalies = np.where(y_pred == -1)[0]
    return anomalies.tolist()

@app.route('/')
def Home():
    return "Hello World"

@app.route('/collect_data', methods=['POST'])
def collect_data():
    duration = request.json.get('duration', 60)  # Default to 60 seconds
    interval = request.json.get('interval', 1)   # Default to 1 second

    network_data = []
    start_time = time.time()

    while time.time() - start_time < duration:
        data = {
            "timestamp": time.time(),
            "network": get_network_stats()
        }
        network_data.append(data)
        time.sleep(interval)

    return jsonify(network_data)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    method = data.get('method', 'z-score')
    
    network_rates = calculate_network_rates(data['network_data'])
    
    results = {}
    for interface, rates in network_rates.items():
        interface_results = {}
        for rate_type in ['bytes_sent_rate', 'bytes_recv_rate', 'packets_sent_rate', 'packets_recv_rate']:
            if method == 'z-score':
                mean, std = calculate_mean_std(rates[rate_type])
                z_scores = calculate_z_scores(np.array(rates[rate_type]), mean, std)
                anomalies = detect_anomalies(rates[rate_type], z_scores, 3).tolist()
            else:  # isolation forest
                anomalies = isolation_forest_anomaly_detection(rates[rate_type])
            
            interface_results[rate_type] = {
                'data': rates[rate_type],
                'anomalies': anomalies
            }
        results[interface] = interface_results
    
    return jsonify(results)

def calculate_network_rates(network_data):
    network_rates = {}
    for interface in network_data[0]['network'].keys():
        network_rates[interface] = {
            "bytes_sent_rate": [],
            "bytes_recv_rate": [],
            "packets_sent_rate": [],
            "packets_recv_rate": []
        }
        
        prev_stats = network_data[0]['network'][interface]
        for current_data in network_data[1:]:
            current_stats = current_data['network'][interface]
            network_rates[interface]["bytes_sent_rate"].append(current_stats["bytes_sent"] - prev_stats["bytes_sent"])
            network_rates[interface]["bytes_recv_rate"].append(current_stats["bytes_recv"] - prev_stats["bytes_recv"])
            network_rates[interface]["packets_sent_rate"].append(current_stats["packets_sent"] - prev_stats["packets_sent"])
            network_rates[interface]["packets_recv_rate"].append(current_stats["packets_recv"] - prev_stats["packets_recv"])
            prev_stats = current_stats
    
    return network_rates

if __name__ == '__main__':
    app.run(debug=True)