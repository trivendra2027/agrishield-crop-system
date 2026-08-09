import pymongo
import sys
sys.path.insert(0, r"c:\AI Crop Disease Detection System")
from backend.app.core.security import hash_password

uri = "mongodb+srv://trivereddy2005_db_user:Trivendra_agrishield_2005@cluster0.viv9i7u.mongodb.net/agrishield_db?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri)
db = client["agrishield_db"]

# Reset locks and set standard passwords
db["users"].update_many({}, {"$set": {"failed_login_attempts": 0, "account_locked_until": None}})

db["users"].update_one(
    {"email": "farmer1@agrishield.com"}, 
    {"$set": {"password_hash": hash_password("Farmer1@1234")}}
)

db["users"].update_one(
    {"email": "admin@agrishield.ai"}, 
    {"$set": {"password_hash": hash_password("Agrisheild@2027")}}
)

print("✅ Password reset to 'Farmer1@1234' for farmer1@agrishield.com and 'Agrisheild@2027' for admin@agrishield.ai in Atlas Cloud!")
