#pragma once
#include <Arduino.h>

struct SD_DeviceInfo {
    char deviceId[32];
    char firmwareVersion[16];
    char hardwareVersion[16];
    uint32_t buildNumber;
    uint32_t bootCount;
    char restartReason[32];
    uint32_t uptimeSeconds;
    uint32_t freeHeap;
    uint32_t largestHeapBlock;
};

struct SD_Network {
    bool wifiConnected;
    char ssid[32];
    int8_t rssi;
    uint8_t wifiQuality;
    char ipAddress[16];
    char gateway[16];
    char dns[16];
    char macAddress[20];
    char hostname[32];
    uint32_t networkLatency;
    bool backendOnline;
    uint32_t backendLatency;
    uint32_t lastSyncTime;
    bool ntpSynced;
    char currentTime[32]; // ISO8601
    uint32_t connectionUptime;
    bool deviceRegistered;
    uint32_t lastHeartbeat;
    uint32_t lastTelemetry;
    uint32_t lastConfigSync;
    uint32_t lastOTAQuery;
    bool apiHealthy;
    uint32_t apiLatency;
    uint16_t lastResponseCode;
    bool authenticationValid;
    
    // Reserved
    bool mqttConnected;
    bool websocketConnected;
    bool bleConnected;
};

struct SD_Sensors {
    float temperature;
    float humidity;
    bool temperatureValid;
    bool humidityValid;
    uint32_t lastUpdate;
    float soilMoisture;
    uint16_t soilADC;
    bool soilValid;
    uint32_t lastSoilUpdate;
    // Reserved
    float soilAverage;
    float soilTrend;
    float soilMin;
    float soilMax;
    float lightIntensity;
    bool lightValid;
    uint32_t lastLightUpdate;
    // Reserved
    float lightRaw;
    float lightAverage;
    float lightMin;
    float lightMax;
    bool rainDetected;
    uint16_t rainAnalog;
    bool rainDigital;
    bool rainValid;
    uint32_t lastRainUpdate;
    float batteryVoltage;
    float batteryPercentage;
    uint16_t batteryADC;
    bool batteryCharging;
    bool batteryLow;
    bool batteryCritical;
    bool batteryHealthy;
    bool batteryValid;
    uint32_t lastBatteryUpdate;
    
    // Reserved Power
    float batteryCurrent;
    float batteryPower;
    float batteryCapacity;
    uint32_t batteryCycles;
    float batteryTemperature;
    
    // Future Placeholders
    float windSpeed;
    float gpsLat;
    float gpsLon;
    float npkNitrogen;
    float npkPhosphorus;
    float npkPotassium;
    float phLevel;
    float waterLevel;
    float flowMeter;
    float co2Level;
};

struct SD_Storage {
    bool sdMounted;
    bool sdHealthy;
    uint32_t pendingRecords;
    char currentLogFile[64];
    uint32_t lastWriteTime;
    uint32_t lastUploadTime;
    uint32_t freeSpaceMB;
    uint32_t usedSpaceMB;
    uint32_t totalSpaceMB;
    bool storageValid;
    
    // Reserved
    bool compressionEnabled;
    bool encryptionEnabled;
    bool logRotationEnabled;
};

struct SD_AI {
    char lastDisease[32];
    float lastConfidence;
    uint32_t lastRecommendationTime;
};

struct SD_System {
    uint8_t currentState; // Enum mapping
    uint8_t currentTheme; 
    uint8_t activePage;
    char errorCode[8];
    bool diagnosticsPassed;
    bool cameraReady;
    bool mqttConnected;
    bool otaInProgress;
};

class SystemData {
public:
    static void init();
    
    // Thread-safe access placeholders (FreeRTOS mutexes can be added here)
    static void lock();
    static void unlock();

    // Getters returning copies for thread-safety
    static SD_DeviceInfo getDeviceInfo();
    static SD_Network getNetwork();
    static SD_Sensors getSensors();
    static SD_Storage getStorage();
    static SD_AI getAI();
    static SD_System getSystem();

    // Setters (granular for managers)
    static void setDeviceInfo(const SD_DeviceInfo& data);
    static void setNetwork(const SD_Network& data);
    static void setSensors(const SD_Sensors& data);
    static void setStorage(const SD_Storage& data);
    static void setAI(const SD_AI& data);
    static void setSystem(const SD_System& data);

private:
    static SD_DeviceInfo _deviceInfo;
    static SD_Network _network;
    static SD_Sensors _sensors;
    static SD_Storage _storage;
    static SD_AI _ai;
    static SD_System _system;
};
