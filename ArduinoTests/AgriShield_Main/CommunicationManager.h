#pragma once
#include <Arduino.h>

enum class CommProtocol { HTTP, MQTT, WEBSOCKET, BLE, ESP_NOW };

class CommunicationManager {
public:
    static void init(CommProtocol protocol = CommProtocol::HTTP);
    
    // Core Abstraction Methods
    static bool sendTelemetry(String payload);
    static bool sendHeartbeat(String payload);
    
    // Future Slots
    static void setupMQTT();
    static void setupBLE();
};
