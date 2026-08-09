#include "SensorManager.h"
#include "SystemData.h"
#include "Logger.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"
#include "MemoryManager.h"
#include <DHT.h>
#include <Wire.h>
// #include <BH1750.h>
// static BH1750 lightMeter;
static bool bh1750_found = false;
static float lastValidLight = 0.0;


#define DHTPIN 4
#define DHTTYPE DHT11
#define SOIL_PIN 34
#define RAIN_A_PIN 35
#define RAIN_D_PIN 32
#define BATT_PIN 33
#define CHARGE_PIN 25 // Dummy pin for charging detection

static float lastValidBattVolt = 0.0;
static float lastValidBattPct = 0.0;
static uint16_t lastValidBattADC = 0;

static float lastValidSoil = 0.0;
static uint16_t lastValidSoilADC = 0;
static bool lastValidRainDetected = false;
static uint16_t lastValidRainAnalog = 0;
static bool lastValidRainDigital = true;


// The DHT instance is hidden inside the cpp, abstracting it from the rest of the firmware
static DHT dht(DHTPIN, DHTTYPE);

void SensorManager::init() {
    // BH1750 Init
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    // BH1750 Init skipped for DHT test
    uint32_t heapAfter = MemoryManager::getFreeHeap();
    
    // Soil Init
    pinMode(SOIL_PIN, INPUT);
    Logger::info("Soil Moisture Sensor Initialized (Analog).");
    
    // Rain Init
    pinMode(RAIN_A_PIN, INPUT);
    pinMode(RAIN_D_PIN, INPUT);
    Logger::info("Rain Sensor Initialized (Analog + Digital).");
    
    // Battery Init
    pinMode(BATT_PIN, INPUT);
    pinMode(CHARGE_PIN, INPUT_PULLUP);
    Logger::info("Battery Monitor Initialized.");


    Logger::debug("BH1750 Init Memory Delta: " + String(heapBefore - heapAfter) + " B");

    Logger::info("Initializing Temp/Hum Sensor (DHT11)...");
    dht.begin();
    
    // Test read to check init
    float t = dht.readTemperature();
    if (isnan(t)) {
        Logger::error("DHT Initialization Failed!");
        ErrorManager::throwError(E101);
    } else {
        Logger::info("DHT Initialized Successfully.");
    }
}

// Internal abstraction for future AHT10 swap
static float _readHardwareTemperature() { return dht.readTemperature(); }
static float _readHardwareHumidity() { return dht.readHumidity(); }

float SensorManager::readTemperature() {
    float t = _readHardwareTemperature();
    if (isnan(t)) {
        Logger::warning("DHT Read Failed. Retrying...");
        delay(100);
        t = _readHardwareTemperature();
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (isnan(t)) {
        Logger::error("DHT Retry Failed.");
        ErrorManager::throwError(E102);
        sens.temperatureValid = false;
    } else {
        Logger::debug("Temperature Read Successful.");
        sens.temperatureValid = true;
        sens.temperature = t;
        sens.lastUpdate = millis();
    }
    SystemData::setSensors(sens);
    return t;
}

float SensorManager::readHumidity() {
    float h = _readHardwareHumidity();
    if (isnan(h)) {
        delay(100);
        h = _readHardwareHumidity();
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (isnan(h)) {
        sens.humidityValid = false;
    } else {
        sens.humidityValid = true;
        sens.humidity = h;
        sens.lastUpdate = millis();
    }
    SystemData::setSensors(sens);
    return h;
}

// Stubs for others

static float _readHardwareLight() {
    return -1.0;
}

float SensorManager::readLight() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = millis();
    
    float lux = _readHardwareLight();
    
    // Validation
    if (lux < 0.0 || lux == 65535.0 || lux > 65535.0 || isnan(lux)) {
        Logger::warning("BH1750 Read Failed (Invalid Data). Retrying...");
        delay(100);
        lux = _readHardwareLight();
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (lux < 0.0 || lux == 65535.0 || lux > 65535.0 || isnan(lux)) {
        Logger::error("BH1750 Retry Failed.");
        ErrorManager::throwError(E202);
        sens.lightValid = false;
        sens.lightIntensity = lastValidLight; // Restore previous
    } else {
        Logger::info("Light Read Successful: " + String(lux, 1) + " lx");
        sens.lightValid = true;
        sens.lightIntensity = lux;
        lastValidLight = lux;
        sens.lastLightUpdate = millis();
    }
    SystemData::setSensors(sens);
    
    unsigned long readTime = millis() - startTime;
    Logger::debug("Sensor Read Processing Time: " + String(readTime) + " ms");
    uint32_t heapAfter = MemoryManager::getFreeHeap();
    if (heapBefore != heapAfter) {
        Logger::warning("Memory leak detected during light read!");
    }
    
    return sens.lightIntensity;
}


// #include "CalibrationManager.h"

static uint16_t _readRawSoilADC() {
    return analogRead(SOIL_PIN);
}

static float _readHardwareSoil(uint16_t &adcOut) {
    adcOut = _readRawSoilADC();
    return 0.0; // Mocked for DHT test
}

float SensorManager::readSoil() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = micros();
    
    uint16_t adc = 0;
    float pct = _readHardwareSoil(adc);
    unsigned long readTime = micros() - startTime;
    Logger::debug("Soil ADC Latency: " + String(readTime) + " us");
    
    // Validation
    if (adc == 0 || adc > 4095 || pct < 0.0 || pct > 100.0) {
        Logger::warning("Soil Read Invalid (ADC=" + String(adc) + "). Retrying...");
        delay(50);
        pct = _readHardwareSoil(adc);
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (adc == 0 || adc > 4095 || pct < 0.0 || pct > 100.0) {
        Logger::error("Soil Retry Failed.");
        ErrorManager::throwError(E302);
        sens.soilValid = false;
        sens.soilADC = lastValidSoilADC;
        sens.soilMoisture = lastValidSoil;
    } else {
        Logger::info("Soil Read: " + String(pct, 1) + "% (ADC: " + String(adc) + ")");
        sens.soilValid = true;
        sens.soilADC = adc;
        sens.soilMoisture = pct;
        lastValidSoil = pct;
        lastValidSoilADC = adc;
        sens.lastSoilUpdate = millis();
    }
    SystemData::setSensors(sens);
    return sens.soilMoisture;
}


static void _readHardwareRain(uint16_t &analog, bool &digital, bool &detected) {
    analog = analogRead(RAIN_A_PIN);
    digital = digitalRead(RAIN_D_PIN);
    // Digital is LOW when rain is detected (usually)
    detected = !digital; 
}

int SensorManager::readRain() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = micros();
    
    uint16_t analog;
    bool digital, detected;
    _readHardwareRain(analog, digital, detected);
    
    unsigned long readTime = micros() - startTime;
    Logger::debug("Rain Latency: " + String(readTime) + " us");
    
    if (analog > 4095) {
        Logger::warning("Rain Analog Invalid. Retrying...");
        delay(50);
        _readHardwareRain(analog, digital, detected);
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (analog > 4095) {
        Logger::error("Rain Retry Failed.");
        ErrorManager::throwError(E402);
        sens.rainValid = false;
        sens.rainAnalog = lastValidRainAnalog;
        sens.rainDigital = lastValidRainDigital;
        sens.rainDetected = lastValidRainDetected;
    } else {
        Logger::info("Rain Read: " + String(detected ? "YES" : "NO") + " (A:" + String(analog) + ", D:" + String(digital) + ")");
        sens.rainValid = true;
        sens.rainAnalog = analog;
        sens.rainDigital = digital;
        sens.rainDetected = detected;
        
        lastValidRainAnalog = analog;
        lastValidRainDigital = digital;
        lastValidRainDetected = detected;
        sens.lastRainUpdate = millis();
    }
    SystemData::setSensors(sens);
    return sens.rainDetected ? 1 : 0;
}


static uint16_t _readBatteryADC() { return analogRead(BATT_PIN); }
static bool _detectCharging() { return digitalRead(CHARGE_PIN) == LOW; } // Example logic

float SensorManager::readBattery() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = micros();

    uint16_t adc = _readBatteryADC();
    float voltage = 4.2; // Mocked
    float pct = 100.0; // Mocked
    bool charging = _detectCharging();
    
    unsigned long readTime = micros() - startTime;
    Logger::debug("Battery Read Latency: " + String(readTime) + " us");

    // Validation
    bool valid = true;
    if (voltage < 0.0f || voltage > 5.0f || adc > 4095 || pct < 0.0f || pct > 100.0f) {
        Logger::warning("Battery Read Invalid. Retrying...");
        delay(50);
        adc = _readBatteryADC();
        voltage = 4.2; // Mocked
        pct = 100.0; // Mocked
        if (voltage < 0.0f || voltage > 5.0f || adc > 4095 || pct < 0.0f || pct > 100.0f) {
            valid = false;
        }
    }

    SD_Sensors sens = SystemData::getSensors();
    if (!valid) {
        Logger::error("Battery Read Failed / Out of Range.");
        ErrorManager::throwError(E503);
        sens.batteryValid = false;
        sens.batteryADC = lastValidBattADC;
        sens.batteryVoltage = lastValidBattVolt;
        sens.batteryPercentage = lastValidBattPct;
    } else {
        Logger::info("Battery Read: " + String(voltage, 2) + "V (" + String(pct, 0) + "%)");
        sens.batteryValid = true;
        sens.batteryADC = adc;
        sens.batteryVoltage = voltage;
        sens.batteryPercentage = pct;
        sens.batteryCharging = charging;
        sens.batteryLow = (pct <= 20.0f);
        sens.batteryCritical = (pct <= 5.0f);
        sens.batteryHealthy = (voltage >= 3.0f);
        
        lastValidBattADC = adc;
        lastValidBattVolt = voltage;
        lastValidBattPct = pct;
        sens.lastBatteryUpdate = millis();
    }
    SystemData::setSensors(sens);
    
    return sens.batteryPercentage;
}

