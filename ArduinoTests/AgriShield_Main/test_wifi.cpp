#include <Arduino.h>
#include "SystemData.h"
#include "WiFiManager.h"
#include "TimeManager.h"
#include "CommunicationManager.h"
#include "StorageManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "MemoryManager.h"

void run_test_wifi() {
    Logger::info("Starting Step 7: Wi-Fi & Network Validation");
    MemoryManager::printMemoryStats();
    
    DisplayManager::init();
    StorageManager::init();
    
    WiFiManager::init();
    WiFiManager::scanNetworks();
    
    TimeManager::init();
    TimeManager::syncNTP();
    
    CommunicationManager::init();
    
    DiagnosticsManager::runSelfTest();
    
    SD_System sys = SystemData::getSystem();
    sys.activePage = 3; // Network Page
    SystemData::setSystem(sys);
    
    unsigned long startTime = millis();
    unsigned long lastUpload = 0;
    
    while (millis() - startTime < 30000) {
        
        WiFiManager::handle();
        
        // Ensure UI Time updates
        TimeManager::getFormattedTime();
        
        if (millis() - lastUpload > 5000) {
            lastUpload = millis();
            String json = JsonManager::buildTelemetryJson();
            CommunicationManager::sendTelemetry(json);
        }
        
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("Wi-Fi & Network Validation Complete.");
}
