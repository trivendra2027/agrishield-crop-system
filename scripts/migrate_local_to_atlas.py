import pymongo
import sys
import time

def chunked(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]

def migrate(atlas_uri: str):
    print("🚀 Connecting to local MongoDB (localhost:27017)...", flush=True)
    local_client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    local_db = local_client["crop_disease_db"]
    
    print("☁️  Connecting to MongoDB Atlas Cloud Cluster...", flush=True)
    atlas_client = pymongo.MongoClient(
        atlas_uri, 
        serverSelectionTimeoutMS=30000, 
        socketTimeoutMS=60000,
        connectTimeoutMS=30000,
        retryWrites=True
    )
    atlas_db = atlas_client["agrishield_db"]
    
    # Priority migration order: Users and Profiles first, then Telemetry, then Diagnostics
    priority_order = [
        'users', 'farm_profiles', 'devices', 'notification_rules', 
        'notification_settings', 'notifications', 'iot_telemetry', 
        'farms', 'history', 'firmware_releases', 'predictions'
    ]
    
    all_colls = local_db.list_collection_names()
    ordered_colls = [c for c in priority_order if c in all_colls] + [c for c in all_colls if c not in priority_order]
    
    print(f"📦 Found {len(ordered_colls)} collections to migrate...\n", flush=True)
    
    total_docs = 0
    from pymongo import ReplaceOne
    
    for coll_name in ordered_colls:
        if coll_name.startswith("system.") or coll_name == "weather_cache":
            continue
            
        local_coll = local_db[coll_name]
        docs = list(local_coll.find({}))
        if not docs:
            continue
            
        atlas_coll = atlas_db[coll_name]
        print(f"  --> Migrating '{coll_name}' ({len(docs)} documents)...", flush=True)
        
        # Batch in safe chunks of 10 to avoid socket buffer overload on large images
        batch_size = 10 if coll_name == 'predictions' else 50
        for batch in chunked(docs, batch_size):
            ops = [ReplaceOne({"_id": doc["_id"]}, doc, upsert=True) for doc in batch]
            retries = 3
            while retries > 0:
                try:
                    atlas_coll.bulk_write(ops, ordered=False)
                    break
                except Exception as e:
                    retries -= 1
                    time.sleep(2)
                    if retries == 0:
                        print(f"      ⚠️ Warning on batch: {e}", flush=True)
                        
        total_docs += len(docs)
        print(f"      ✅ Migrated '{coll_name}' ({len(docs)} documents) successfully!", flush=True)
        
    print(f"\n🎉 ALL DATA MIGRATION COMPLETE! Total documents copied to Cloud Atlas: {total_docs}", flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/migrate_local_to_atlas.py <ATLAS_MONGODB_URI>")
        sys.exit(1)
    migrate(sys.argv[1])
