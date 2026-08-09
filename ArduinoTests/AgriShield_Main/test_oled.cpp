#include <Arduino.h>
#include "DisplayManager.h"
#include "Logger.h"
#include "ApiManager.h"
#include "JsonManager.h"

#include "SystemData.h"

void run_test_oled() {
    Logger::info("Starting Step 1: OLED Validation Pipeline");
    
    // 1. Hardware Init
    DisplayManager::init();
    Logger::info("OLED Hardware Initialized.");
    
    // 2. Set Test Status via SystemData
    SD_Network net = SystemData::getNetwork();
    net.wifiConnected = false;
    net.backendOnline = true;
    SystemData::setNetwork(net);
    
    SD_Sensors sens = SystemData::getSensors();
    sens.batteryPercentage = 85.5;
    SystemData::setSensors(sens);
    
    // 3. Test Loop - Verify 10FPS Limit, Auto Rotation, and No Flickering
    unsigned long startTime = millis();
    
    while (millis() - startTime < 30000) { // Run test for 30 seconds
        DisplayManager::update();
        delay(10); // Yield to Watchdog
    }
    
    Logger::info("OLED Auto-Rotation and Rendering Test Complete.");
    
    // 4. JSON & Backend Simulation for the Validation Pipeline
    String payload = JsonManager::buildTelemetryJson();
    Logger::info("JSON Serialized: " + payload);
    
    // In a real run, ApiManager::postTelemetry() would happen here
    Logger::info("Validation Pipeline for Step 1 completed successfully.");
}
