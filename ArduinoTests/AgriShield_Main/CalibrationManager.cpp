#include "CalibrationManager.h"
// Stubs for Soil, Battery

static uint16_t dryADC = 3500; // Bone dry
static uint16_t wetADC = 1500; // Submerged in water

float CalibrationManager::applySoilCalibration(uint16_t adc) {
    if (adc > dryADC) adc = dryADC;
    if (adc < wetADC) adc = wetADC;
    return map(adc, dryADC, wetADC, 0, 100);
}


// Battery Config (4300 mAh Single-Cell 3.7V / 4.2V 18650 Li-ion Battery)
static float adcRef = 3.3f;
static float dividerRatio = 5.0f; // 5:1 resistor divider for 3-pin Voltage Sensor module
static float minVoltage = 3.00f;  // Discharge Cutoff (0% empty)
static float maxVoltage = 4.20f;  // Full Charge (100% full)

float CalibrationManager::applyBatteryCalibration(uint16_t adc) {
    float pinVoltage = (adc / 4095.0f) * adcRef;
    float voltage = pinVoltage * dividerRatio;
    return voltage;
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
