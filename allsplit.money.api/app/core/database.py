from pymongo import MongoClient

from app.core.config import get_settings

settings = get_settings()
client = MongoClient(settings.mongodb_uri)
db = client[settings.mongodb_db_name]

users_collection = db["users"]
otp_collection = db["otp"]
bills_collection = db["bills"]
split_collection = db["bill_splits"]
people_collection = db["people"]
audit_logs_collection = db["audit_logs"]
