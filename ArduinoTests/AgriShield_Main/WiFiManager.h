#pragma once
#include <Arduino.h>

class WiFiManager {
public:
    static void init();
    static void handle();
    static void disconnect();
    static bool isConnected();
    static void scanNetworks();
    static void updateSystemData();
    
private:
    static void connectToBestNetwork();
    static uint8_t calculateSignalQuality(int8_t rssi);
};
