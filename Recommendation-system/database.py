import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["test"]  # your database name

def convert_objectids(obj):
    """Recursively convert all ObjectId values to strings."""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    return obj

def get_all_packages():
    packages = list(db.packages.find())
    cleaned = []
    for pkg in packages:
        pkg = convert_objectids(pkg)  # converts ALL ObjectIds recursively
        pkg["id"] = pkg.pop("_id")   # rename _id to id
        cleaned.append(pkg)
    return cleaned