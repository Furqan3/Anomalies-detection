# db.py
import pymongo
from datetime import datetime, timedelta
from retrieve_system_data import get_system_data
import time
class mydatabase:
    def __init__(self):
        self.client = pymongo.MongoClient("mongodb://localhost:27017/")
        self.db = self.client["systemdb"]
        self.collection = self.db["systemdata"]
        self.collection.create_index("timestamp")
    def insert(self, data):
        try:
            twenty_four_hours_ago = datetime.now() - tim