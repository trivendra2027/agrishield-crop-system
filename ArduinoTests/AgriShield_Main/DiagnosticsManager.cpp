#include "DiagnosticsManager.h"
#include "SystemData.h"
#include "Logger.h"
#include "StorageManager.h"
#include "LedManager.h"

void DiagnosticsManager::runSelfTest() {
    Logger::info("--- Diagnostics Report ---");
    SD_Sensors sens = SystemData::getSensors();
    
    // AHT20 Temperature + Humidity
    if (sens.temperatureValid) {
        Logger::info("AHT20 Temp: PASS (Last Read: " + String(sens.temperature) + " C)");
    } else {
        Logger::error("AHT20 Temp: FAIL");
    }
    if (sens.humidityValid) {
        Logger::info("AHT20 Humid: PASS (Last Read: " + String(sens.humidity) + " %)");
    } else {
        Logger::error("AHT20 Humid: FAIL");
    }

    // BMP280 Pressure
    if (sens.pressureValid) {
        Logger::info("BMP280: PASS (Last Read: " + String(sens.pressure, 1) + " hPa)");
    } else {
        Logger::error("BMP280: FAIL");
    }
    
    // BH1750 Light
    if (sens.lightValid) {
        Logger::info("BH1750: PASS (Comm OK, Last Read: " + String(sens.lightIntensity) + "lx)");
    } else {
        Logger::error("BH1750: FAIL (Comm Failed)");
    }
    
    // Soil
    if (sens.soilValid) {
        Logger::info("Soil: PASS (ADC: " + String(sens.soilADC) + ")");
    } else {
        Logger::error("Soil: FAIL");
    }
    
    // Rain
    if (sens.rainValid) {
        Logger::info("Rain: PASS (Analog: " + String(sens.rainAnalog) + ")");
    } else {
        Logger::error("Rain: FAIL");
    }
    
    // Battery
    if (sens.batteryValid) {
        Logger::info("Battery: PASS (" + String(sens.batteryVoltage, 2) + "V, " + String(sens.batteryPercentage, 0) + "%)");
        if (sens.batteryCharging) Logger::info("Power: CHARGING");
    } else {
        Logger::error("Battery: FAIL");
    }

    // SD Card
    if (SystemData::getStorage().sdMounted) {
        bool rwPass = StorageManager::runDiagnosticsTest();
        if (rwPass) Logger::info("SD Card: PASS (Read/Write OK)");
        else Logger::error("SD Card: FAIL (R/W Error)");
    } else {
        Logger::error("SD Card: FAIL (Not Mounted)");
    }
    
    // WiFi
    SD_Network net = SystemData::getNetwork();
    if (net.wifiConnected) {
        Logger::info("WiFi: PASS (" + String(net.ssid) + ", " + String(net.rssi) + "dBm)");
    } else {
        Logger::error("WiFi: FAIL");
    }
    if (net.apiHealthy) Logger::info("Backend Ping: PASS (" + String(net.apiLatency) + "ms)");
    else Logger::error("Backend Ping: FAIL");
    
    if (net.deviceRegistered) Logger::info("API Registration: PASS");
    else Logger::error("API Registration: FAIL");

    // LED Test
    Logger::info("LED Indicators: Running Test Sequence...");
    LedManager::runTestSequence();
    Logger::info("LED Indicators: PASS");
    
    Logger::info("--------------------------");
}
