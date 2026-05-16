from pymongo import MongoClient
import os

client = MongoClient("mongodb://localhost:27017")
db = client["allsplit_db"]

 
users_collection = db["users"]
otp_collection = db["otp"]
bills_collection = db["bills"] 

# NEW COLLECTION
split_collection = db["bill_splits"]
