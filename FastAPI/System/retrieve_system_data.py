# retrieve_system_data.py
import psutil
import time

def get_ram_usage():
    '''This Function returns the current Ram percentage in use'''
    return psutil.virtual_memory().percent

def get_cpu_usage():
    '''This Function returns the CPU percentage in use'''
    return psutil.cpu_percent(interval=1)

def get_process_data():
    '''This Function returns the process data including pid, name, memory_percent, cpu_percent, status, and create_time'''
    process_data = {}
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent', 'cpu_percent', 'status', 'create_time']):
        process_data[str(proc.info['pid'])] = proc.info  
    return process_data

def get_system_data():
    system_data = {}
    system_data['timestamp'] = time.time()  
    system_data['ram_usage'] = float(get_ram_usage())
    system_data['cpu_usage'] = float(get_cpu_usage())
    system_data['process_data'] = get_process_data()
    return system_data

if __name__ == "__main__":
    print(get_system_data())