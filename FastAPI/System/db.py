# db.py
import pymongo
from datetime import datetime, timedelta
from System.retrieve_system_data import get_system_data
import time
class mydatabase:
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb://localhost:27017/")
        self.db = self.client["systemdb"]
        self.collection = self.db["systemdata"]
        self.collection.create_index("timestamp")
    def insert(self, data):
        try:
            twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
            self.collection.delete_many({"timestamp": {"$lt": twenty_four_hours_ago.timestamp()}})
            self.collection.insert_one(data)
        except Exception as e:
            print(f"An error occurred during insert operation: {e}")
    def get_data(self):
        cursor = self.collection.find({}, {"_id": 0})
        data = {}
        for index, document in enumerate(cursor):
            data[index] = document
        return data

    
    def __del__(self):
        self.client.close()

if __name__=='__main__':
    db = mydatabase()
    try:
        for i in range (1000):
            data = get_system_data()
            db.insert(data)
            time.sleep(2)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.__del__()  