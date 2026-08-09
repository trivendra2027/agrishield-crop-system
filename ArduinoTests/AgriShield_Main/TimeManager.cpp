#include "TimeManager.h"
#include <WiFi.h>
#include <time.h>
#include <sys/time.h>
#include <cstring>
#include "SystemData.h"
#include "Logger.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"

const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.nist.gov";
const char* ntpServer3 = "time.google.com";
const long  gmtOffset_sec = 19800; // IST Offset (UTC + 5:30 = 19,800 seconds)
const int   daylightOffset_sec = 0;

void TimeManager::init() {}

void TimeManager::setTimeFromEpoch(uint32_t epochSec) {
    struct timeval tv;
    tv.tv_sec = epochSec;
    tv.tv_usec = 0;
    settimeofday(&tv, NULL);
    
    SD_Network net = SystemData::getNetwork();
    net.ntpSynced = true;
    
    time_t now = epochSec;
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);
    char timeStringBuff[32];
    strftime(timeStringBuff, sizeof(timeStringBuff), "%I:%M %p", &timeinfo);
    strncpy(net.currentTime, timeStringBuff, sizeof(net.currentTime)-1);
    SystemData::setNetwork(net);
    
    Logger::info("Hardware RTC clock updated via Bluetooth to: " + String(timeStringBuff));
}

void TimeManager::setCustomTime(int hours, int mins, bool isPM) {
    int h24 = hours;
    if (isPM && h24 < 12) h24 += 12;
    if (!isPM && h24 == 12) h24 = 0;
    
    // Default base date: 2026-07-25
    struct tm t;
    t.tm_year = 2026 - 1900;
    t.tm_mon = 6;
    t.tm_mday = 25;
    t.tm_hour = h24;
    t.tm_min = mins;
    t.tm_sec = 0;
    t.tm_isdst = 0;
    
    time_t epoch = mktime(&t);
    if (epoch != -1) {
        setTimeFromEpoch((uint32_t)epoch);
    }
}

void TimeManager::setCustomTimeString(const String& timeStr) {
    String str = timeStr;
    str.trim();
    
    // Check if epoch timestamp e.g. "1721860000"
    if (str.length() >= 9 && str.toInt() > 1000000000) {
        setTimeFromEpoch((uint32_t)str.toInt());
        return;
    }
    
    // Check format HH:MM AM/PM or HH:MM
    int colonPos = str.indexOf(':');
    if (colonPos > 0) {
        int hr = str.substring(0, colonPos).toInt();
        int min = str.substring(colonPos + 1, colonPos + 3).toInt();
        bool isPM = (str.indexOf("PM") >= 0 || str.indexOf("pm") >= 0);
        if (hr > 12) isPM = false; // 24-hr format
        setCustomTime(hr, min, isPM);
    }
}

void TimeManager::syncNTP() {
    if (WiFi.status() != WL_CONNECTED) return;

    SD_Network net = SystemData::getNetwork();
    Logger::info("Syncing NTP Time...");
    unsigned long start = millis();
    
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2, ntpServer3);
    
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo, 3000)){ // 3 second fast timeout
        Logger::warning("NTP Sync Timeout (UDP 123 blocked or offline). Continuing normal operation.");
        net.ntpSynced = false;
    } else {
        unsigned long syncTime = millis() - start;
        Logger::info("NTP Synced Successfully. Latency: " + String(syncTime) + " ms");
        net.ntpSynced = true;
        
        char timeStringBuff[32];
        strftime(timeStringBuff, sizeof(timeStringBuff), "%I:%M %p", &timeinfo);
        strncpy(net.currentTime, timeStringBuff, sizeof(net.currentTime)-1);
    }
    SystemData::setNetwork(net);
}

String TimeManager::getFormattedTime() {
    time_t now;
    time(&now);
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);
    
    // If RTC has been synced via NTP or Bluetooth (year >= 2020)
    if (timeinfo.tm_year >= 120) {
        char timeStringBuff[32];
        strftime(timeStringBuff, sizeof(timeStringBuff), "%I:%M %p", &timeinfo);
        
        SD_Network net = SystemData::getNetwork();
        strncpy(net.currentTime, timeStringBuff, sizeof(net.currentTime)-1);
        SystemData::setNetwork(net);
        
        return String(timeStringBuff);
    }
    
    SD_Network net = SystemData::getNetwork();
    if (net.currentTime[0] != '\0' && strcmp(net.currentTime, "00:00") != 0 && strcmp(net.currentTime, "--:--") != 0) {
        return String(net.currentTime);
    }
    
    // Fallback System Uptime Clock for Offline / Bluetooth Mode (Format: 00:05 or 01:20)
    uint32_t totalSec = millis() / 1000;
    uint32_t hours = (totalSec / 3600) % 24;
    uint32_t mins = (totalSec / 60) % 60;
    char uptimeBuff[16];
    snprintf(uptimeBuff, sizeof(uptimeBuff), "%02u:%02u", hours, mins);
    return String(uptimeBuff);
}

String TimeManager::getISO8601Timestamp() {
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)){
        return "1970-01-01T00:00:00Z";
    }
    char timeStringBuff[32];
    strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(timeStringBuff);
}

uint32_t TimeManager::getUptimeSeconds() {
    return millis() / 1000;
}

void TimeManager::syncRTC() {} // Placeholder
