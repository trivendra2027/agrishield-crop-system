#include <Arduino.h>
#include "SystemData.h"
#include "WiFiManager.h"
#include "CommunicationManager.h"
#include "StorageManager.h"
#include "ApiManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "MemoryManager.h"

void run_test_api() {
    Logger::info("Starting Step 8: API Manager & Cloud Communication");
    MemoryManager::printMemoryStats();
    
    DisplayManager::init();
    StorageManager::init();
    
    WiFiManager::init();
    CommunicationManager::init();
    
    unsigned long startTime = millis();
    unsigned long lastUpload = 0;
    unsigned long lastHeartbeat = 0;
    
    while (millis() - startTime < 45000) {
        
        WiFiManager::handle();
        
        // Heartbeat every 10 seconds
        if (millis() - lastHeartbeat > 10000) {
            lastHeartbeat = millis();
            if (SystemData::getNetwork().wifiConnected) {
                ApiManager::sendHeartbeat();
            }
        }
        
        // Telemetry every 5 seconds
        if (millis() - lastUpload > 5000) {
            lastUpload = millis();
            String json = JsonManager::buildTelemetryJson();
            CommunicationManager::sendTelemetry(json);
            
            // Check diagnostics dynamically
            DiagnosticsManager::runSelfTest();
        }
        
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("API Manager Validation Complete.");
}
