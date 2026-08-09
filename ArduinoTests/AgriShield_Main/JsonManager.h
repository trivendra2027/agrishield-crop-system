#pragma once
#include <Arduino.h>
class JsonManager {
public:
    static String buildTelemetryJson();
    static String buildHeartbeatJson();
    static String buildRegistrationJson();
};
