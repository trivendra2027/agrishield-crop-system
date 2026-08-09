import asyncio
import argparse
import sys
import os

sys.path.insert(0, r"c:\AI Crop Disease Detection System")

from backend.app.db.mongodb import connect_to_mongo, db_instance
from backend.app.core.security import hash_password, validate_password_strength

async def create_or_update_account(email: str, password: str, role: str, full_name: str = "Administrator"):
    is_valid, msg = validate_password_strength(password)
    if not is_valid:
        print(f"❌ Error: Password does not meet security requirements: {msg}")
        print("💡 Password must be at least 12 characters and contain uppercase, lowercase, number, and special character (e.g. AgriShield#2026!).")
        return False
        
    await connect_to_mongo()
    db = db_instance.db
    users_coll = db["users"]
    
    pwd_hash = hash_password(password)
    existing = await users_coll.find_one({"email": email.lower().strip()})
    
    if existing:
        await users_coll.update_one(
            {"email": email.lower().strip()},
            {"$set": {
                "password_hash": pwd_hash,
                "role": role.lower(),
                "failed_login_attempts": 0,
                "account_locked_until": None
            }}
        )
        print(f"✅ SUCCESS: Updated existing account '{email}' to role '{role.upper()}' with new password.")
    else:
        doc = {
            "email": email.lower().strip(),
            "full_name": full_name,
            "role": role.lower(),
            "password_hash": pwd_hash,
            "password_history": [pwd_hash],
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "created_at": "2026-07-25T00:00:00Z"
        }
        await users_coll.insert_one(doc)
        print(f"🎉 SUCCESS: Created NEW '{role.upper()}' account!")
        print(f"   Email: {email}")
        print(f"   Role: {role.upper()}")
        print(f"   Password: {password}")

def main():
    parser = argparse.ArgumentParser(description="AgriShield Admin & Tester Account Creator / Password Reset Tool")
    parser.add_argument("--email", required=True, help="User email address")
    parser.add_argument("--password", required=True, help="New password (min 12 chars, uppercase, lowercase, number, special char)")
    parser.add_argument("--role", default="admin", choices=["admin", "tester", "farmer"], help="Account role")
    parser.add_argument("--name", default="AgriShield Admin", help="Full name")
    
    args = parser.parse_args()
    asyncio.run(create_or_update_account(args.email, args.password, args.role, args.name))

if __name__ == "__main__":
    main()
