#pragma once
#include <Arduino.h>

class TimeManager {
public:
    static void init();
    static void syncNTP();
    static String getFormattedTime();
    static String getISO8601Timestamp();
    static uint32_t getUptimeSeconds();
    
    static void setTimeFromEpoch(uint32_t epochSec);
    static void setCustomTime(int hours, int mins, bool isPM = false);
    static void setCustomTimeString(const String& timeStr);
    static void syncRTC(); 
};
