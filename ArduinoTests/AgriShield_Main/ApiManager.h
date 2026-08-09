#pragma once
#include <Arduino.h>

class ApiManager {
public:
    static void init();
    static bool checkHealth();
    static bool registerDevice();
    static bool sendHeartbeat();
    static bool postTelemetry(String payload);
    static bool downloadConfig();
    static bool checkOTA();
    
private:
    static String currentApiBaseUrl;
    static String performHttpRequest(String endpoint, String payload, String method, uint16_t* outCode);
    static String performRetriedHttpRequest(String endpoint, String payload, String method, uint16_t* outCode);
};
