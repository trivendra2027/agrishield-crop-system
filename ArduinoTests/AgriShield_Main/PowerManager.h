#pragma once
#include <Arduino.h>

enum class PowerMode { NORMAL, CHARGING, LOW_BATTERY, CRITICAL, SLEEP, SHUTDOWN, DEEP_SLEEP };

class PowerManager {
public:
    static void init();
    static void evaluatePowerState();
    
    // Future Reservations
    static void enterDeepSleep();
    static void enterSleep();
    static void shutdown();
    static void configureWakeSources();
};
