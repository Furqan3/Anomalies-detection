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
from Network.network_rate import calculate_network_rates

app = Flask(__name__)
CORS(app)


def isolation_forest_anomaly_detection(data, contamination=0.05):
    X = np.array(data).reshape(-1, 1)
    clf = IsolationForest(contamination=contamination, random_state=42)
    clf.fit(X)
    y_pred = clf.predict(X)
    anomalies = np.where(y_pred == -1)[0]
    return anomalies.tolist()

@app.route('/')
def Home():
    return "Anomaly Detection Homepage"

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
        with open("network_data.json", "a") as f:
            f.write(json.dumps(data) + "\n")
        time.sleep(interval)

    return jsonify(network_data)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    method = data.get('method', 'z-score')
    
    
    
    network_rates = calculate_network_rates()
    
    results = {}
    for interface, rates in network_rates.items():
        interface_results = {}
        for rate_type in ['bytes_sent_rate', 'bytes_recv_rate', 'packets_sent_rate', 'packets_recv_rate']:
            if method == 'z-score':
                print(method)
                mean, std = calculate_mean_std(rates[rate_type])
                z_scores = calculate_z_scores(np.array(rates[rate_type]), mean, std)
                anomalies = detect_anomalies(rates[rate_type], z_scores, 3).tolist()
            else:  # isolation forest
                print(method)
                anomalies = isolation_forest_anomaly_detection(rates[rate_type])
            
            anomaly_info = []
            
            if len(anomalies) > 0:            
                for idx in anomalies:
                    # get process info
                    rate_value = rates[rate_type][idx]
                    process_info = get_process_info_by_pid(int(rate_value))  # Convert rate to int for PID
                    anomaly_info.append({
                        "index": idx,
                        "rate_value": rate_value,
                        "process_info": process_info
                    })
                                   
            interface_results[rate_type] = {
                'data': rates[rate_type],
                'anomalies': anomaly_info,
                
            }
        results[interface] = interface_results
    
    return jsonify(results)



if __name__ == '__main__':
    app.run(debug=True)