#pragma once
#include <Arduino.h>
class CalibrationManager {
public:
    static float applySoilCalibration(uint16_t adc);
    static float applyBatteryCalibration(uint16_t adc);
    static float calculateBatteryPercentage(float voltage);
    static float applyLuxOffset(float rawLux);
    static float applyLuxScale(float rawLux);
    static float applyMovingAverage(float rawLux);
    static void triggerAutoGain();
};
