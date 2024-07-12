# detection.py
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest


def zscore_anomalies(data, threshold=2):
   
    data = np.array(data).reshape(-1, 1)
    z_scores = np.abs(stats.zscore(data))
    anomalies = np.where(z_scores > threshold )[0]
    return anomalies.tolist()


def isolation_forest_anomalies(data, contamination=0.1):
   
    data = np.array(data).reshape(-1, 1)
    clf = IsolationForest(contamination=contamination, random_state=100)
    clf.fit(data)
    anomalies = np.where(clf.predict(data) == -1)[0]
    anomalies = anomalies.tolist()
    return anomalies

def multivariate_isolation_forest_anomalies(cpu_values,ram_values,contamination=0.1):
    
    X = np.column_stack((ram_values, cpu_values))
    clf = IsolationForest(contamination=contamination, random_state=100)
    clf.fit(X)
    anomalies = np.where(clf.predict(X) == -1)[0]
    return anomalies.tolist()

def multivariate_zscore_anomalies(cpu_values,ram_values, threshold=2):

    X = np.column_stack((ram_values, cpu_values))
    mean = np.mean(X, axis=0)
    cov = np.cov(X, rowvar=False)
    inv_cov = np.linalg.inv(cov)
    mahalanobis_distances = []
    for x in X:
        diff = x - mean
        maha_dist = np.sqrt(diff.dot(inv_cov).dot(diff))
        mahalanobis_distances.append(maha_dist)
    z_scores = stats.zscore(mahalanobis_distances)
    anomalies = np.where(np.abs(z_scores) > threshold)[0]
    return anomalies.tolist()

def get_mydata(data):
    cpu=[]
    ram=[]
    for i in data:
        cpu.append(data[i]['cpu_usage'])
        ram.append(data[i]['ram_usage'])
    return cpu,ram

def get_anomolies(data):
    cpu_data,ram_data=get_mydata(data)
    anomalies = {}
    anomalies['zscore_anomalies_cpu'] = zscore_anomalies(cpu_data )
    anomalies['zscore_anomalies_ram'] = zscore_anomalies(ram_data)
    anomalies['isolation_forest_anomalies_cpu'] = isolation_forest_anomalies(cpu_data)
    anomalies['isolation_forest_anomalies_ram'] = isolation_forest_anomalies(ram_data)
    anomalies['multivariate_isolation_forest_anomalies'] = multivariate_isolation_forest_anomalies(cpu_data,ram_data)
    anomalies['multivariate_zscore_anomalies'] = multivariate_zscore_anomalies(cpu_data,ram_data)
    return anomalies