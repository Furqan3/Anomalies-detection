import numpy as np
import psutil
# Function to calculate mean and std deviation
def calculate_mean_std(data):
    mean = np.mean(data)
    std = np.std(data)
    return mean, std

# Function to calculate Z-score with a check for zero std deviation
def calculate_z_scores(data, mean, std):
    if std == 0:
        return np.zeros_like(data)
    z_scores = (data - mean) / std
    return z_scores

# Function to detect anomalies
def detect_anomalies(data, z_scores, threshold):
    anomalies = np.where(np.abs(z_scores) > threshold)[0]
    return anomalies
# Function to get process information by PID
def get_process_info_by_pid(pid):
    
    if not isinstance(pid, int) or pid <= 0:
        print(f"Invalid PID: {pid}")
        return None
    try:
        proc = psutil.Process(pid)
        return {
            "pid": pid,
            "name": proc.name(),
            "username": proc.username(),
            
        }
    except psutil.NoSuchProcess:
        return None
    except psutil.AccessDenied:
        return None
    except psutil.ZombieProcess:
        return None