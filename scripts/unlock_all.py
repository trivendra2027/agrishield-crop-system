import asyncio
import sys
sys.path.insert(0, r"c:\AI Crop Disease Detection System")

from backend.app.db.mongodb import connect_to_mongo, db_instance

async def main():
    await connect_to_mongo()
    db = db_instance.db
    res = await db.users.update_many(
        {},
        {"$set": {"failed_login_attempts": 0, "account_locked_until": None}}
    )
    print(f"🔓 Successfully unlocked {res.modified_count} account(s)!")

if __name__ == "__main__":
    asyncio.run(main())
