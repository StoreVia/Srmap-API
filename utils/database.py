from pymongo import MongoClient
import os

client = MongoClient(os.getenv("server"))

mongo_db = client["college_db"]
users_collection = mongo_db["users"]