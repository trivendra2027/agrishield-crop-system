#include "JsonManager.h"
#include <ArduinoJson.h>
#include "SystemData.h"
#include "BluetoothManager.h"
#include "TimeManager.h"

String JsonManager::buildTelemetryJson() {
    StaticJsonDocument<768> doc;
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    SD_Sensors sens = SystemData::getSensors();
    SD_Network net = SystemData::getNetwork();
    SD_Storage stor = SystemData::getStorage();
    
    doc["device_id"] = dev.deviceId;
    doc["firmware_version"] = dev.firmwareVersion;
    doc["timestamp"] = TimeManager::getFormattedTime();
    
    if (sens.temperatureValid) doc["temperature"] = sens.temperature; else doc["temperature"] = nullptr;
    doc["temperature_valid"] = sens.temperatureValid;
    
    if (sens.humidityValid) doc["humidity"] = sens.humidity; else doc["humidity"] = nullptr;
    doc["humidity_valid"] = sens.humidityValid;
    
    if (sens.pressureValid) doc["pressure"] = sens.pressure; else doc["pressure"] = nullptr;
    doc["pressure_valid"] = sens.pressureValid;
    
    if (sens.soilValid) {
        doc["soil_percentage"] = sens.soilMoisture;
        doc["soil_moisture"] = sens.soilMoisture;
    } else {
        doc["soil_percentage"] = nullptr;
        doc["soil_moisture"] = nullptr;
    }
    doc["soil_adc"] = sens.soilADC;
    doc["soil_valid"] = sens.soilValid;
    
    if (sens.lightValid) {
        doc["light_lux"] = sens.lightIntensity;
        doc["light_intensity"] = sens.lightIntensity;
    } else {
        doc["light_lux"] = nullptr;
        doc["light_intensity"] = nullptr;
    }
    doc["light_valid"] = sens.lightValid;
    
    doc["rain_detected"] = (sens.rainValid && sens.rainDetected) ? 1 : 0;
    doc["rain_sensor"] = (sens.rainValid && sens.rainDetected) ? 1 : 0;
    doc["rain_analog"] = sens.rainAnalog;
    doc["rain_digital"] = sens.rainDigital ? 1 : 0;
    doc["rain_valid"] = sens.rainValid;

    if (sens.batteryValid) {
        doc["battery_voltage"] = sens.batteryVoltage;
        doc["battery_percentage"] = sens.batteryPercentage;
    } else {
        doc["battery_voltage"] = nullptr;
        doc["battery_percentage"] = nullptr;
    }
    doc["battery_adc"] = sens.batteryADC;
    doc["battery_valid"] = sens.batteryValid;
    doc["battery_low"] = sens.batteryLow;
    doc["battery_critical"] = sens.batteryCritical;
    doc["battery_charging"] = sens.batteryCharging;
    doc["battery_health"] = sens.batteryHealthy;
    
    doc["sd_mounted"] = stor.sdMounted ? 1 : 0;
    doc["sd_used_mb"] = stor.usedSpaceMB;
    doc["sd_total_mb"] = stor.totalSpaceMB;
    
    doc["wifi_rssi"] = net.rssi;
    doc["wifi_quality"] = net.wifiQuality;
    doc["wifi_connected"] = net.wifiConnected;
    doc["bluetooth_connected"] = BluetoothManager::isConnected();
    
    String payload;
    serializeJson(doc, payload);
    return payload;
}

String JsonManager::buildRegistrationJson() {
    StaticJsonDocument<256> doc;
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    doc["device_id"] = dev.deviceId;
    doc["hardware_version"] = dev.hardwareVersion;
    doc["firmware_version"] = dev.firmwareVersion;
    String payload;
    serializeJson(doc, payload);
    return payload;
}

String JsonManager::buildHeartbeatJson() {
    StaticJsonDocument<256> doc;
    SD_DeviceInfo dev = SystemData::getDeviceInfo();
    SD_Network net = SystemData::getNetwork();
    SD_Sensors sens = SystemData::getSensors();
    
    doc["device_id"] = dev.deviceId;
    doc["firmware_version"] = dev.firmwareVersion;
    doc["uptime"] = dev.uptimeSeconds;
    doc["heap"] = dev.freeHeap;
    doc["battery"] = sens.batteryPercentage;
    doc["wifi"] = net.wifiConnected;
    doc["ip"] = net.ipAddress;
    doc["signal"] = net.rssi;
    doc["timestamp"] = net.currentTime;
    
    String payload;
    serializeJson(doc, payload);
    return payload;
}
