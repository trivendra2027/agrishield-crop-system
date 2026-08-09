/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: OLED Display (SSD1306)
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - Adafruit SH110X (by Adafruit)
 * - Adafruit GFX Library (by Adafruit)
 * - Adafruit BusIO
 * 
 * WIRING:
 * ESP32 3V3  -> OLED VCC
 * ESP32 GND  -> OLED GND
 * ESP32 G22  -> OLED SCL
 * ESP32 G21  -> OLED SDA
 * 
 * OLED I2C ADDRESS: 0x3C (or 0x3D)
 * BAUD RATE: 115200
 * =========================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// Flat Includes for Arduino IDE
#include "SystemData.h"
#include "MemoryManager.h"
#include "ErrorManager.h"
#include "DisplayManager.h"
#include "Logger.h"

unsigned long lastPageChange = 0;
unsigned long lastFrameTime = 0;
unsigned long lastHeartbeatTime = 0;
int testPage = 1;
uint32_t frameCount = 0;

void scanI2C() {
    Logger::info("Starting I2C Scanner...");
    Wire.begin();
    int nDevices = 0;
    for(byte address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();
        if (error == 0) {
            String msg = "I2C device found at address 0x";
            if (address < 16) msg += "0";
            msg += String(address, HEX);
            Logger::info(msg);
            
            if (address == 0x3C || address == 0x3D) {
                Logger::info("--> Detected potential OLED Display!");
            }
            nDevices++;
        }
    }
    if (nDevices == 0) {
        Logger::error("No I2C devices found. Check wiring!");
    } else {
        Logger::info("I2C Scan Complete.");
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n==========================================");
    Serial.println("Hardware Validation Mode: OLED (SSD1306)");
    Serial.println("==========================================");
    
    scanI2C();
    
    if (!DisplayManager::init()) {
        Serial.println("CRITICAL HALT: DisplayManager failed to initialize.");
        Serial.println("RESULT: FAIL");
        while(1) { delay(100); } // Halt safely
    }
    
    // Inject Dummy Values for UI Verification
    SD_System sys = SystemData::getSystem();
    sys.activePage = 1;
    SystemData::setSystem(sys);

    SD_Sensors sens = SystemData::getSensors();
    sens.temperature = 24.5;
    sens.temperatureValid = true;
    sens.humidity = 60.2;
    sens.soilMoisture = 45.0;
    sens.soilValid = true;
    sens.lightIntensity = 850;
    sens.lightValid = true;
    sens.batteryPercentage = 85;
    sens.batteryValid = true;
    sens.batteryCharging = false;
    SystemData::setSensors(sens);

    SD_Network net = SystemData::getNetwork();
    net.wifiConnected = false;
    net.backendOnline = false;
    strcpy(net.currentTime, "12:00");
    SystemData::setNetwork(net);
    
    Serial.println("OLED Init Complete. Entering non-blocking test loop.");
    Serial.println("RESULT: PASS (Initialization)");
}

void loop() {
    unsigned long currentMillis = millis();
    
    // Page Rotation Logic (every 3s)
    if (currentMillis - lastPageChange >= 3000) {
        lastPageChange = currentMillis;
        testPage++;
        if (testPage > 6) testPage = 1;
        
        SD_System sys = SystemData::getSystem();
        sys.activePage = testPage;
        SystemData::setSystem(sys);
    }
    
    // Display Update (10 FPS)
    if (currentMillis - lastFrameTime >= 100) {
        lastFrameTime = currentMillis;
        DisplayManager::update();
        frameCount++;
    }
    
    // Serial Heartbeat (every 5s)
    if (currentMillis - lastHeartbeatTime >= 5000) {
        lastHeartbeatTime = currentMillis;
        uint32_t freeHeap = MemoryManager::getFreeHeap();
        Serial.println("Heartbeat | Frames Rendered: " + String(frameCount) + " | Free Heap: " + String(freeHeap) + " B");
    }
}
