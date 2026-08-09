#include "Logger.h"
#include "Config.h"

void Logger::info(String msg) {
    if (DEBUG_MODE >= 1) Serial.println("[INFO] " + msg);
}
void Logger::warning(String msg) {
    if (DEBUG_MODE >= 1) Serial.println("[WARN] " + msg);
}
void Logger::error(String msg) {
    if (DEBUG_MODE >= 1) Serial.println("[ERROR] " + msg);
}
void Logger::debug(String msg) {
    if (DEBUG_MODE >= 2) Serial.println("[DEBUG] " + msg);
}
