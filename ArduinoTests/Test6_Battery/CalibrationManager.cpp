#include "CalibrationManager.h"
// Stubs for Soil, Battery

static uint16_t dryADC = 3500; // Bone dry
static uint16_t wetADC = 1500; // Submerged in water

float CalibrationManager::applySoilCalibration(uint16_t adc) {
    if (adc > dryADC) adc = dryADC;
    if (adc < wetADC) adc = wetADC;
    return map(adc, dryADC, wetADC, 0, 100);
}


// Battery Config
static float adcRef = 3.3f;
static float dividerRatio = 2.0f; // e.g. 10k/10k
static float minVoltage = 3.2f;
static float maxVoltage = 4.2f;
static float offset = 0.0f;
static float scale = 1.0f;

float CalibrationManager::applyBatteryCalibration(uint16_t adc) {
    float voltage = (adc / 4095.0f) * adcRef * dividerRatio;
    return (voltage * scale) + offset;
}

float CalibrationManager::calculateBatteryPercentage(float voltage) {
    if (voltage >= maxVoltage) return 100.0f;
    if (voltage <= minVoltage) return 0.0f;
    return ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100.0f;
}


// Reserved BH1750 Extensions
float CalibrationManager::applyLuxOffset(float rawLux) { return rawLux; } // Placeholder
float CalibrationManager::applyLuxScale(float rawLux) { return rawLux; } // Placeholder
float CalibrationManager::applyMovingAverage(float rawLux) { return rawLux; } // Placeholder
void CalibrationManager::triggerAutoGain() { } // Placeholder
