#include <Arduino.h>
#include "SystemData.h"
#include "StorageManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "MemoryManager.h"

void run_test_sdcard() {
    Logger::info("Starting Step 6: SD Card Offline Storage Validation");
    MemoryManager::printMemoryStats();
    
    DisplayManager::init();
    StorageManager::init();
    
    DiagnosticsManager::runSelfTest();
    
    SD_System sys = SystemData::getSystem();
    sys.activePage = 4; // Jump to Storage Page
    SystemData::setSystem(sys);
    
    unsigned long startTime = millis();
    unsigned long lastQueue = 0;
    
    while (millis() - startTime < 30000) {
        
        // Simulate Offline Queuing every 3 seconds
        if (millis() - lastQueue > 3000) {
            lastQueue = millis();
            
            String dummyJson = "{\"simulated_telemetry\": " + String(millis()) + "}";
            StorageManager::enqueueRecord(dummyJson);
            Logger::info("Queued Offline Record. Total: " + String(SystemData::getStorage().pendingRecords));
        }
        
        // Simulate Backend Reconnection Upload every 10 seconds
        if (millis() % 10000 < 10) {
            if (SystemData::getStorage().pendingRecords > 0) {
                Logger::info("Simulating backend reconnect... Uploading FIFO queue...");
                String out = StorageManager::dequeueRecord();
                StorageManager::confirmUpload();
            }
        }
        
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("SD Card Offline Storage Validation Complete.");
}
