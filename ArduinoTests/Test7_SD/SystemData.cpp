#include "SystemData.h"

// Define static members
SD_DeviceInfo SystemData::_deviceInfo = {};
SD_Network SystemData::_network = {};
SD_Sensors SystemData::_sensors = {};
SD_Storage SystemData::_storage = {};
SD_AI SystemData::_ai = {};
SD_System SystemData::_system = {};

void SystemData::init() {
    // Initialize dummy data for testing Phase 1 OLED
    strcpy(_deviceInfo.deviceId, "ESP32-ALPHA");
    strcpy(_deviceInfo.firmwareVersion, "v2.5.0");
    strcpy(_deviceInfo.hardwareVersion, "1.0.0");
    _deviceInfo.freeHeap = ESP.getFreeHeap();
    _deviceInfo.largestHeapBlock = ESP.getMaxAllocHeap();
    strcpy(_deviceInfo.restartReason, "POWER_ON");
    
    _network.wifiConnected = false;
    strcpy(_network.ssid, "");
    _network.rssi = -100;
    _network.wifiQuality = 0;
    strcpy(_network.ipAddress, "0.0.0.0");
    strcpy(_network.gateway, "0.0.0.0");
    strcpy(_network.dns, "0.0.0.0");
    strcpy(_network.macAddress, "00:00:00:00:00:00");
    strcpy(_network.hostname, "ESP32-AgriShield");
    _network.networkLatency = 0;
    _network.backendOnline = false;
    _network.backendLatency = 0;
    _network.lastSyncTime = 0;
    _network.ntpSynced = false;
    strcpy(_network.currentTime, "00:00");
    _network.connectionUptime = 0;
    _network.deviceRegistered = false;
    _network.lastHeartbeat = 0;
    _network.lastTelemetry = 0;
    _network.lastConfigSync = 0;
    _network.lastOTAQuery = 0;
    _network.apiHealthy = false;
    _network.apiLatency = 0;
    _network.lastResponseCode = 0;
    _network.authenticationValid = false;
    
    _sensors.temperature = 25.4f;
    _sensors.humidity = 60.2f;
    _sensors.temperatureValid = false;
    _sensors.humidityValid = false;
    _sensors.lastUpdate = 0;
    _sensors.soilMoisture = 45.0f;
    _sensors.soilADC = 2048;
    _sensors.soilValid = false;
    _sensors.lastSoilUpdate = 0;
    _sensors.lightIntensity = 850.0f;
    _sensors.lightValid = false;
    _sensors.lastLightUpdate = 0;
    _sensors.rainDetected = false;
    _sensors.rainAnalog = 4095;
    _sensors.rainDigital = true;
    _sensors.rainValid = false;
    _sensors.lastRainUpdate = 0;
    _sensors.batteryPercentage = 85.5f;
    _sensors.batteryVoltage = 3.9f;
    _sensors.batteryADC = 2048;
    _sensors.batteryCharging = false;
    _sensors.batteryLow = false;
    _sensors.batteryCritical = false;
    _sensors.batteryHealthy = true;
    _sensors.batteryValid = false;
    _sensors.lastBatteryUpdate = 0;
    
    _storage.sdMounted = false;
    _storage.sdHealthy = false;
    _storage.pendingRecords = 0;
    strcpy(_storage.currentLogFile, "");
    _storage.lastWriteTime = 0;
    _storage.lastUploadTime = 0;
    _storage.freeSpaceMB = 0;
    _storage.usedSpaceMB = 0;
    _storage.totalSpaceMB = 0;
    _storage.storageValid = false;
    
    _system.activePage = 1;
}

void SystemData::lock() {
    // Future FreeRTOS xSemaphoreTake
}
void SystemData::unlock() {
    // Future FreeRTOS xSemaphoreGive
}

SD_DeviceInfo SystemData::getDeviceInfo() { lock(); SD_DeviceInfo d = _deviceInfo; unlock(); return d; }
SD_Network SystemData::getNetwork() { lock(); SD_Network d = _network; unlock(); return d; }
SD_Sensors SystemData::getSensors() { lock(); SD_Sensors d = _sensors; unlock(); return d; }
SD_Storage SystemData::getStorage() { lock(); SD_Storage d = _storage; unlock(); return d; }
SD_AI SystemData::getAI() { lock(); SD_AI d = _ai; unlock(); return d; }
SD_System SystemData::getSystem() { lock(); SD_System d = _system; unlock(); return d; }

void SystemData::setDeviceInfo(const SD_DeviceInfo& data) { lock(); _deviceInfo = data; unlock(); }
void SystemData::setNetwork(const SD_Network& data) { lock(); _network = data; unlock(); }
void SystemData::setSensors(const SD_Sensors& data) { lock(); _sensors = data; unlock(); }
void SystemData::setStorage(const SD_Storage& data) { lock(); _storage = data; unlock(); }
void SystemData::setAI(const SD_AI& data) { lock(); _ai = data; unlock(); }
void SystemData::setSystem(const SD_System& data) { lock(); _system = data; unlock(); }
