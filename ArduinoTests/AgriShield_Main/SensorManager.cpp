#include "SensorManager.h"
#include "SystemData.h"
#include "Logger.h"
#include "ErrorManager.h"
#include "ErrorCodes.h"
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP280.h>

// ==========================================
// I2C SENSORS (Shared Bus: SDA=D21, SCL=D22)
// ==========================================
static BH1750 lightMeter;
static Adafruit_AHTX0 aht;
static Adafruit_BMP280 bmp;

static bool bh1750_found = false;
static bool aht_found = false;
static bool bmp_found = false;
static float lastValidLight = 0.0;
static float lastValidPressure = 0.0;

// ==========================================
// PIN DEFINITIONS (Matches Wiring Diagram v2.0)
// ==========================================
#define SOIL_PIN     34   // Capacitive Soil Moisture Sensor (AO -> GPIO34 ADC)
#define RAIN_A_PIN   35   // Rain Sensor Module (AO -> GPIO35 ADC)
#define RAIN_D_PIN   33   // Rain Sensor Module (DO -> GPIO33 optional digital)
#define BATT_PIN     32   // Voltage Sensor Module (S -> GPIO32 ADC)
#define CHARGE_PIN   14   // TP4056 Charging Status (GPIO14 optional)

static float lastValidBattVolt = 0.0;
static float lastValidBattPct = 0.0;
static uint16_t lastValidBattADC = 0;

static float lastValidSoil = 0.0;
static uint16_t lastValidSoilADC = 0;
static bool lastValidRainDetected = false;
static uint16_t lastValidRainAnalog = 0;
static bool lastValidRainDigital = true;


void SensorManager::init() {
    Wire.begin(21, 22);
    Wire.setTimeOut(15); // Fast 15ms bus timeout so missing/unplugged field sensors never lock I2C bus

    // ---- BH1750 Init FIRST (I2C Light Sensor) ----
    Logger::info("Initializing Light Sensor (BH1750)...");
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    
    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
        Logger::info("BH1750 Initialized at 0x23");
        bh1750_found = true;
    } else if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x5C, &Wire)) {
        Logger::info("BH1750 Initialized at 0x5C");
        bh1750_found = true;
    } else {
        Logger::warning("BH1750 not found at 0x23/0x5C during boot (will auto-retry).");
        bh1750_found = false;
    }
    uint32_t heapAfter = MemoryManager::getFreeHeap();
    Logger::debug("BH1750 Init Memory Delta: " + String(heapBefore - heapAfter) + " B");

    // ---- AHT20 Init (I2C Temperature + Humidity) ----
    Logger::info("Initializing Temp/Hum Sensor (AHT20)...");
    if (aht.begin()) {
        Logger::info("AHT20 Initialized Successfully.");
        aht_found = true;
    } else {
        Logger::warning("AHT20 not connected.");
        aht_found = false;
    }

    // ---- BMP280 Init (I2C Atmospheric Pressure) ----
    Logger::info("Initializing Pressure Sensor (BMP280)...");
    if (bmp.begin(0x76)) {
        Logger::info("BMP280 Initialized at 0x76.");
        bmp_found = true;
    } else if (bmp.begin(0x77)) {
        Logger::info("BMP280 Initialized at 0x77.");
        bmp_found = true;
    } else {
        Logger::warning("BMP280 not connected.");
        bmp_found = false;
    }
    
    // ---- Soil Init (Analog) ----
    pinMode(SOIL_PIN, INPUT);
    Logger::info("Soil Moisture Sensor Initialized (Analog).");
    
    // ---- Rain Init (Analog + Digital) ----
    pinMode(RAIN_A_PIN, INPUT);
    pinMode(RAIN_D_PIN, INPUT);
    Logger::info("Rain Sensor Initialized (Analog + Digital).");
    
    // ---- Battery / Voltage Sensor Init ----
    pinMode(BATT_PIN, INPUT);
    analogSetPinAttenuation(BATT_PIN, ADC_11db);
    pinMode(CHARGE_PIN, INPUT_PULLUP);
    Logger::info("Battery Monitor Initialized (D36 VP + Charge on D4).");
}

// ==========================================
// AHT20 Temperature & Humidity (I2C)
// ==========================================
static float _readHardwareTemperature() {
    if (!aht_found) return NAN;
    sensors_event_t humidity, temp;
    aht.getEvent(&humidity, &temp);
    return temp.temperature;
}

static float _readHardwareHumidity() {
    if (!aht_found) return NAN;
    sensors_event_t humidity, temp;
    aht.getEvent(&humidity, &temp);
    return humidity.relative_humidity;
}

float SensorManager::readTemperature() {
    SD_Sensors sens = SystemData::getSensors();
    if (!aht_found) {
        sens.temperatureValid = false;
        sens.temperature = NAN;
        SystemData::setSensors(sens);
        return NAN;
    }
    
    float t = _readHardwareTemperature();
    if (isnan(t)) {
        sens.temperatureValid = false;
        sens.temperature = NAN;
    } else {
        sens.temperatureValid = true;
        sens.temperature = t;
        sens.lastUpdate = millis();
    }
    SystemData::setSensors(sens);
    return t;
}

float SensorManager::readHumidity() {
    SD_Sensors sens = SystemData::getSensors();
    if (!aht_found) {
        sens.humidityValid = false;
        sens.humidity = NAN;
        SystemData::setSensors(sens);
        return NAN;
    }
    
    float h = _readHardwareHumidity();
    if (isnan(h)) {
        sens.humidityValid = false;
        sens.humidity = NAN;
    } else {
        sens.humidityValid = true;
        sens.humidity = h;
        sens.lastUpdate = millis();
    }
    SystemData::setSensors(sens);
    return h;
}

// ==========================================
// BMP280 Atmospheric Pressure (I2C)
// ==========================================
static float _readHardwarePressure() {
    if (!bmp_found) return NAN;
    return bmp.readPressure() / 100.0F; // Convert Pa to hPa
}

float SensorManager::readPressure() {
    SD_Sensors sens = SystemData::getSensors();
    if (!bmp_found) {
        sens.pressureValid = false;
        sens.pressure = NAN;
        SystemData::setSensors(sens);
        return NAN;
    }

    float p = _readHardwarePressure();
    if (isnan(p) || p < 300.0 || p > 1200.0) {
        sens.pressureValid = false;
        sens.pressure = NAN;
    } else {
        Logger::info("Pressure Read: " + String(p, 1) + " hPa");
        sens.pressureValid = true;
        sens.pressure = p;
        lastValidPressure = p;
        sens.lastPressureUpdate = millis();
    }
    SystemData::setSensors(sens);
    return sens.pressure;
}

// ==========================================
// BH1750 Light Sensor (I2C)
// ==========================================
#include "CalibrationManager.h"

static float _readHardwareLight() {
    Wire.clearWriteError();
    if (!bh1750_found) {
        if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
            bh1750_found = true;
        } else if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x5C, &Wire)) {
            bh1750_found = true;
        } else {
            return -1.0;
        }
    }
    unsigned long start = micros();
    float lux = lightMeter.readLightLevel();
    unsigned long latency = micros() - start;
    Logger::debug("I2C BH1750 Read Latency: " + String(latency) + " us");
    return lux;
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
    if (!bh1750_found || lux < 0.0 || lux == 65535.0 || lux > 65535.0 || isnan(lux)) {
        Logger::error("BH1750 Read Invalid or Sensor Unplugged.");
        sens.lightValid = false;
        sens.lightIntensity = NAN;
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

// ==========================================
// Soil Moisture Sensor (Analog - GPIO 34)
// ==========================================
static uint16_t _readRawSoilADC() {
    return analogRead(SOIL_PIN);
}

static float _readHardwareSoil(uint16_t &adcOut) {
    adcOut = _readRawSoilADC();
    return CalibrationManager::applySoilCalibration(adcOut);
}

float SensorManager::readSoil() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = micros();
    
    uint16_t adc = 0;
    float pct = _readHardwareSoil(adc);
    unsigned long readTime = micros() - startTime;
    Logger::debug("Soil ADC Latency: " + String(readTime) + " us");
    
    // Validation: floating unconnected pin reads 0 or > 4000
    if (adc <= 100 || adc >= 4050 || pct < 0.0 || pct > 100.0) {
        Logger::warning("Soil Read Invalid / Unconnected (ADC=" + String(adc) + "). Retrying...");
        delay(50);
        pct = _readHardwareSoil(adc);
    }
    
    SD_Sensors sens = SystemData::getSensors();
    if (adc <= 100 || adc >= 4050 || pct < 0.0 || pct > 100.0) {
        Logger::error("Soil Sensor Unconnected.");
        sens.soilValid = false;
        sens.soilADC = adc;
        sens.soilMoisture = NAN;
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

// ==========================================
// Rain Sensor (Analog D35 + Digital D32)
// ==========================================
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
        // Floating digital pin check: require analog water reading > 100 to confirm rain
        bool realRain = (analog > 100) && detected;
        Logger::info("Rain Read: " + String(realRain ? "YES" : "NO") + " (A:" + String(analog) + ", D:" + String(digital) + ")");
        sens.rainValid = (analog > 0);
        sens.rainAnalog = analog;
        sens.rainDigital = digital;
        sens.rainDetected = realRain;
        
        lastValidRainAnalog = analog;
        lastValidRainDigital = digital;
        lastValidRainDetected = detected;
        sens.lastRainUpdate = millis();
    }
    SystemData::setSensors(sens);
    return sens.rainDetected ? 1 : 0;
}

// ==========================================
// Battery / Voltage Sensor (Analog D36 VP)
// ==========================================
// Battery Monitor with Oversampling & Monotonic Discharge Filter
// ==========================================
static uint16_t _readBatteryADC() {
    uint32_t sum = 0;
    for (int i = 0; i < 16; i++) {
        sum += analogRead(BATT_PIN);
        delayMicroseconds(100);
    }
    return sum / 16;
}
static bool _detectCharging() { return digitalRead(CHARGE_PIN) == LOW; }

static float smoothedBatteryVoltage = 0.0f;
static float lastMonotonicBatteryPct = -1.0f;

float SensorManager::readBattery() {
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    unsigned long startTime = micros();

    uint16_t adc = _readBatteryADC();
    uint32_t mv = analogReadMilliVolts(BATT_PIN);
    float pinVolts = mv / 1000.0f;
    float rawVoltage = pinVolts * 5.0f; // 5:1 scaling matches physical 3.93V multimeter
    if (rawVoltage < 0.1f && adc > 0) {
        rawVoltage = CalibrationManager::applyBatteryCalibration(adc);
    }

    // Exponential Moving Average (EMA) Smoothing
    if (smoothedBatteryVoltage < 0.1f) {
        smoothedBatteryVoltage = rawVoltage;
    } else {
        smoothedBatteryVoltage = (smoothedBatteryVoltage * 0.85f) + (rawVoltage * 0.15f);
    }

    float voltage = smoothedBatteryVoltage;
    float rawPct = CalibrationManager::calculateBatteryPercentage(voltage);
    bool charging = _detectCharging();
    
    // Monotonic Discharge Lock: Percentage can ONLY decrease when discharging!
    float pct = rawPct;
    if (lastMonotonicBatteryPct < 0.0f) {
        lastMonotonicBatteryPct = rawPct;
    } else if (!charging) {
        if (rawPct < lastMonotonicBatteryPct) {
            lastMonotonicBatteryPct = rawPct; // Allow decrease
        }
        pct = lastMonotonicBatteryPct; // Hold steady, never jump up from noise
    } else {
        lastMonotonicBatteryPct = rawPct; // Allow increase when charging
    }
    
    unsigned long readTime = micros() - startTime;
    Logger::debug("Battery Read Latency: " + String(readTime) + " us");

    // Validation
    bool valid = true;
    if (voltage < 0.1f || voltage > 5.0f || adc > 4095) {
        Logger::warning("Battery Read Invalid. Retrying...");
        delay(50);
        adc = _readBatteryADC();
        mv = analogReadMilliVolts(BATT_PIN);
        voltage = (mv / 1000.0f) * 5.0f;
        pct = CalibrationManager::calculateBatteryPercentage(voltage);
        if (voltage < 0.1f || voltage > 5.0f || adc > 4095) {
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
