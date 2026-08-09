#include "PowerManager.h"
#include "SystemData.h"
#include "Logger.h"

static PowerMode currentMode = PowerMode::NORMAL;

void PowerManager::init() {
    Logger::info("PowerManager Initialized.");
}

void PowerManager::evaluatePowerState() {
    SD_Sensors sens = SystemData::getSensors();
    if (!sens.batteryValid) return;

    PowerMode prevMode = currentMode;

    if (sens.batteryCharging) {
        currentMode = PowerMode::CHARGING;
    } else if (sens.batteryPercentage <= 5.0f) {
        currentMode = PowerMode::CRITICAL;
    } else if (sens.batteryPercentage <= 20.0f) {
        currentMode = PowerMode::LOW_BATTERY;
    } else {
        currentMode = PowerMode::NORMAL;
    }

    if (prevMode != currentMode) {
        Logger::info("Power State Changed.");
    }
}

// Stubs
void PowerManager::enterDeepSleep() {}
void PowerManager::enterSleep() {}
void PowerManager::shutdown() {}
void PowerManager::configureWakeSources() {}
