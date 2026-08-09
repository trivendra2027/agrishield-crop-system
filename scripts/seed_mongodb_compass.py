import asyncio
import sys
from datetime import datetime
from bson import ObjectId

sys.path.insert(0, r"c:\AI Crop Disease Detection System")

from backend.app.db.mongodb import connect_to_mongo, db_instance
from backend.app.core.security import hash_password

async def seed_all_mongodb_compass_collections():
    print("🚀 Connecting to MongoDB on localhost:27017/crop_disease_db...")
    await connect_to_mongo()
    db = db_instance.db

    # 1. SEED USERS COLLECTION
    users_coll = db["users"]
    admin_pwd_hash = hash_password("Agrisheild@2027")
    user_pwd_hash = hash_password("StrongP@ss123!")

    demo_users = [
        {
            "name": "System Administrator",
            "email": "admin@agrishield.ai",
            "password_hash": admin_pwd_hash,
            "role": "admin",
            "preferred_language": "en",
            "farm_location": "Guntur, Andhra Pradesh",
            "farming_practices": "Precision Farming",
            "farm_profile_completed": True,
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "created_at": datetime.utcnow().isoformat(),
            "password_history": [admin_pwd_hash]
        },
        {
            "name": "Enterprise QA Tester",
            "email": "tester@agrishield.ai",
            "password_hash": user_pwd_hash,
            "role": "tester",
            "preferred_language": "en",
            "farm_location": "Hyderabad, Telangana",
            "farming_practices": "Organic Hydroponics",
            "farm_profile_completed": True,
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "created_at": datetime.utcnow().isoformat(),
            "password_history": [user_pwd_hash]
        },
        {
            "name": "Standard Farmer",
            "email": "user@agrishield.ai",
            "password_hash": user_pwd_hash,
            "role": "farmer",
            "preferred_language": "en",
            "farm_location": "",
            "farming_practices": "",
            "farm_profile_completed": False,
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "created_at": datetime.utcnow().isoformat(),
            "password_history": [user_pwd_hash]
        }
    ]

    for u in demo_users:
        await users_coll.update_one(
            {"email": u["email"]},
            {"$set": u},
            upsert=True
        )
    print("✅ Collection 'users' updated cleanly with Admin, Tester & Farmer accounts!")

    # 2. SEED FARMS COLLECTION
    farms_coll = db["farms"]
    demo_farms = [
        {
            "farm_name": "Green Field Sector A",
            "crop_type": "Tomato & Chilli",
            "location": "Guntur, Andhra Pradesh",
            "soil_type": "Black Cotton Soil",
            "irrigation_type": "Drip Irrigation",
            "sector_area_acres": 12.5,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "farm_name": "Sunrise Agro Orchard",
            "crop_type": "Cotton & Maize",
            "location": "Vijayawada, Andhra Pradesh",
            "soil_type": "Alluvial Soil",
            "irrigation_type": "Sprinkler",
            "sector_area_acres": 8.0,
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    for f in demo_farms:
        await farms_coll.update_one(
            {"farm_name": f["farm_name"]},
            {"$set": f},
            upsert=True
        )
    print("✅ Collection 'farms' updated with sample crop sectors!")

    # 3. SEED DEVICES / TELEMETRY COLLECTION
    devices_coll = db["devices"]
    demo_devices = [
        {
            "device_id": "ESP32-NODE-01",
            "device_name": "Field Sector 1 Master Transceiver",
            "status": "online",
            "hardware": "ESP32 WROOM-32",
            "firmware_version": "v2.4.0",
            "telemetry": {
                "temperature": 28.5,
                "humidity": 68.2,
                "soil_moisture": 54.0,
                "rain_detected": False,
                "light_lux": 14200,
                "cpu_load": 14,
                "wifi_rssi": -62,
                "sd_card": "Mounted 4MHz (FAT32 OK)",
                "leds": {
                    "power": True,
                    "wifi": True,
                    "mqtt": True,
                    "sensor_bus": True,
                    "sd_card": True,
                    "alert_led": False
                }
            },
            "last_seen": datetime.utcnow().isoformat()
        }
    ]
    for d in demo_devices:
        await devices_coll.update_one(
            {"device_id": d["device_id"]},
            {"$set": d},
            upsert=True
        )
    print("✅ Collection 'devices' updated with ESP32 IoT Node status!")

    # 4. SEED NOTIFICATIONS COLLECTION
    notif_coll = db["notifications"]
    sample_notifs = [
        {
            "notification_id": "NOTIF-101",
            "title": "🟢 ESP32 Node Connected",
            "message": "Field Node ESP32-NODE-01 linked successfully via 4MHz SPI & WiFi.",
            "category": "Hardware",
            "priority": "Low",
            "read": False,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "notification_id": "NOTIF-102",
            "title": "🛡️ OWASP Security Audit Passed",
            "message": "System Admin portal security audit score verified at 100/100 Grade A+.",
            "category": "Security",
            "priority": "Low",
            "read": True,
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    for n in sample_notifs:
        await notif_coll.update_one(
            {"notification_id": n["notification_id"]},
            {"$set": n},
            upsert=True
        )
    print("✅ Collection 'notifications' updated!")

    print("\n🎉 ALL MONGODB COMPASS COLLECTIONS FOR 'crop_disease_db' UPDATED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(seed_all_mongodb_compass_collections())
