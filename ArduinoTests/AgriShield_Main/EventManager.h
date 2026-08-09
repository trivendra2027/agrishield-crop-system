#pragma once
#include <Arduino.h>
#include <functional>

enum class EventType {
    SENSOR_UPDATED,
    WIFI_CONNECTED,
    WIFI_DISCONNECTED,
    SYSTEM_ERROR,
    BACKEND_OFFLINE,
    BATTERY_LOW,
    BUTTON_PRESS
};

typedef std::function<void(void*)> EventCallback;

class EventManager {
public:
    static void subscribe(EventType type, EventCallback callback);
    static void publish(EventType type, void* payload = nullptr);
};
