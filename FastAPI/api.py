from fastapi import FastAPI
from bson import json_util
from System.db import mydatabase
from System.detection import get_anomolies
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)


@app.get("/")
def index():
    massage='get_data'
    return massage

@app.get("/get_data")
def get_data():
    try:
        db = mydatabase()
        data = db.get_data()
        data['anomolies']=get_anomolies(data)
        
        return data
    except Exception as e:
        return f"An Error Occurred: {e}"

    
