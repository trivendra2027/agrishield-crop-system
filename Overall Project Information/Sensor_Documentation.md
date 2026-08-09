# 🌡️ Sensor Documentation – Agri Shield

## Overview

The Agri Shield ESP32 node uses 4 primary sensor modules to collect environmental data. This document details each sensor's working principle, electrical specifications, GPIO connections, calibration procedure, and expected output values.

---

## Sensor Index

| # | Sensor | Measurement | Interface | GPIO |
|---|--------|-------------|-----------|------|
| 1 | AHT10 | Temperature + Humidity | I2C | SDA=21, SCL=22 |
| 2 | BH1750 | Light Intensity (Lux) | I2C | SDA=21, SCL=22 |
| 3 | Capacitive Soil Moisture v1.2 | Soil Moisture % | Analog | GPIO 34 |
| 4 | Rain Sensor Module | Rain Presence | Analog | GPIO 35 |

---

## 1. AHT10 – Temperature & Humidity Sensor

### Overview
The AHT10 is a calibrated digital temperature and humidity sensor that communicates over I2C. It replaces the older DHT22 with improved accuracy, faster response time, and better stability.

### Working Principle
The AHT10 uses a **capacitive humidity sensing element** and a **thermistor-based temperature element**. The IC digitizes both readings and sends them in a 48-bit data packet over I2C after calibration initialization.

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage | 2.2V – 5.5V |
| Recommended Voltage | 3.3V |
| Operating Current | 23µA (measurement), 1µA (sleep) |
| I2C Address | 0x38 |
| Communication | I2C (400kHz max) |

### Measurement Ranges

| Measurement | Range | Accuracy |
|-------------|-------|----------|
| Temperature | -40°C to +85°C | ±0.3°C |
| Humidity | 0% to 100% RH | ±2% RH |
| Response Time | 5 seconds (typical) | – |

### GPIO Connections

| AHT10 Pin | ESP32 GPIO | Notes |
|-----------|-----------|-------|
| VCC | 3.3V | Do NOT use 5V directly on I/O |
| GND | GND | Common ground |
| SDA | GPIO 21 | Shared I2C bus |
| SCL | GPIO 22 | Shared I2C bus |

### Initialization Sequence
```
1. Power ON
2. Wait 40ms (startup)
3. Send calibration command: 0xBE, 0x08, 0x00
4. Wait 10ms
5. Send trigger measurement: 0xAC, 0x33, 0x00
6. Wait 80ms
7. Read 6 bytes of data
8. Parse humidity (20-bit) and temperature (20-bit)
```

### Data Parsing Formula
```
Raw data (6 bytes): Status | Hum[0..19] | Temp[0..19]

Humidity (%)    = (raw_hum / 2^20) × 100
Temperature (°C) = (raw_temp / 2^20) × 200 - 50
```

### Expected Output
```json
{
  "temperature": 28.5,
  "humidity": 65.2
}
```

### Calibration Notes
- No user calibration required (factory calibrated).
- If readings drift after long operation, power cycle the sensor.
- Avoid exposing to chemicals or condensation for extended periods.

### Limitations
- Cannot measure below -40°C or above 85°C.
- High humidity environments (>90%) can cause temporary offset.
- Should not be used within 3cm of heat-generating components.

---

## 2. BH1750 – Ambient Light Sensor

### Overview
The BH1750 is a 16-bit digital light sensor that measures light intensity in Lux over I2C. It is designed to automatically reject 50/60Hz power-frequency light noise (flickering fluorescent lamps).

### Working Principle
A photodiode converts incoming photons into electrical current. An internal ADC digitizes this signal. The sensor can be configured for high-resolution, low-resolution, or continuous measurement modes.

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage | 2.4V – 3.6V |
| Recommended Voltage | 3.3V |
| I2C Address | 0x23 (ADDR pin LOW) or 0x5C (ADDR pin HIGH) |
| Max Lux | 65,535 Lux |
| Resolution | 1 Lux (High Res Mode) or 0.5 Lux (High Res Mode 2) |

### Measurement Modes

| Mode | Resolution | Measurement Time |
|------|-----------|-----------------|
| Continuously H-Res Mode | 1 Lux | 120ms |
| Continuously H-Res Mode 2 | 0.5 Lux | 120ms |
| Continuously L-Res Mode | 4 Lux | 16ms |
| One-Time H-Res Mode | 1 Lux | 120ms |

### GPIO Connections

| BH1750 Pin | ESP32 GPIO | Notes |
|-----------|-----------|-------|
| VCC | 3.3V | |
| GND | GND | |
| SDA | GPIO 21 | Shared I2C |
| SCL | GPIO 22 | Shared I2C |
| ADDR | GND | Sets address to 0x23 |

### Expected Lux Reference Values

| Environment | Lux Range |
|-------------|-----------|
| Dark/Night | 0 – 10 Lux |
| Overcast sky | 100 – 1,000 Lux |
| Partial cloud | 1,000 – 25,000 Lux |
| Full sunlight | 25,000 – 65,000 Lux |
| Indoor artificial | 50 – 500 Lux |

### Expected Output
```json
{
  "light_intensity": 8542.0
}
```

### Calibration Notes
- No manual calibration needed.
- Place sensor away from direct LED light sources (can saturate readings).
- Ensure clear line of sight to the sky for accurate outdoor readings.

### Limitations
- Cannot measure IR or UV light.
- Saturates at 65,535 Lux.

---

## 3. Capacitive Soil Moisture Sensor v1.2

### Overview
This is a corrosion-resistant capacitive soil moisture sensor. Unlike resistive sensors, it does not corrode over time because it uses capacitance change (not electrolysis) to measure soil water content.

### Working Principle
The sensor uses a variable capacitor formed between two plates embedded in the PCB. As soil moisture increases, the dielectric constant between the plates changes, altering the capacitance. A 555 timer circuit converts this capacitance to a voltage output proportional to moisture level.

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage | 3.3V – 5.5V |
| Recommended Voltage | 3.3V |
| Output | Analog voltage (0–3.3V) |
| ADC Resolution | 12-bit (ESP32) → 0 to 4095 |
| Response Time | < 1 second |

### GPIO Connection

| Sensor Pin | ESP32 GPIO | Notes |
|-----------|-----------|-------|
| VCC | 3.3V | |
| GND | GND | |
| AOUT | GPIO 34 | INPUT-ONLY ADC pin |

### Calibration Procedure

The raw ADC output must be calibrated to percentage:

```
Step 1: Measure RAW_DRY by placing sensor in completely dry air
        (typical: 2800–3200 ADC)
Step 2: Measure RAW_WET by submerging sensor tip in water
        (typical: 1000–1400 ADC)
Step 3: Percentage formula:
        moisture_pct = 100 - ((raw - RAW_WET) / (RAW_DRY - RAW_WET)) * 100

Default calibration constants:
  RAW_DRY = 3100
  RAW_WET = 1200
```

### Expected Output
```json
{
  "soil_moisture": 42.5
}
```

### Moisture Level Interpretation

| Range | Interpretation | Action |
|-------|---------------|--------|
| 0–25% | Very Dry | Irrigate immediately |
| 25–50% | Dry | Consider irrigation |
| 50–70% | Optimal | No action needed |
| 70–85% | Moist | Monitor |
| 85–100% | Waterlogged | Check drainage |

### Limitations
- Must be calibrated per soil type (clay vs sandy soil gives different readings).
- Cannot be submerged permanently (PCB damage).
- Temperature affects capacitance slightly.

---

## 4. Rain Sensor Module

### Overview
A simple analog rain detection sensor consisting of a conductive sensing pad and a comparator IC. The sensing pad detects rain droplets through conductance change.

### Working Principle
When raindrops fall on the sensor pad, they bridge the interdigitated copper traces, reducing resistance. The analog output voltage drops proportionally to rain intensity.

### Electrical Specifications

| Parameter | Value |
|-----------|-------|
| Operating Voltage | 3.3V – 5V |
| Recommended Voltage | 3.3V |
| Output | Analog (AO) + Digital (DO) |
| ADC Resolution | 12-bit (ESP32) |

### GPIO Connection

| Sensor Pin | ESP32 GPIO | Notes |
|-----------|-----------|-------|
| VCC | 3.3V | |
| GND | GND | |
| AO | GPIO 35 | Used for analog reading |
| DO | Not connected | Digital threshold (not used) |

### Rain Level Interpretation

| ADC Raw Value | Mapped % | Status |
|--------------|---------|--------|
| 0–500 | 100% | Heavy rain |
| 500–1500 | 75% | Moderate rain |
| 1500–2500 | 50% | Light rain |
| 2500–3500 | 25% | Drizzle |
| 3500–4095 | 0% | No rain (dry) |

```
rain_pct = 100 - (raw_adc / 4095) * 100
```

### Expected Output
```json
{
  "rain_sensor": 0,
  "rain_level_pct": 0.0
}
```

> `rain_sensor: 1` = Rain detected; `rain_sensor: 0` = No rain

### Calibration Notes
- The rain threshold is determined by: `rain_sensor = (rain_pct > 30) ? 1 : 0`
- Sensitivity can be adjusted by the onboard potentiometer on the comparator board.

### Limitations
- Cannot distinguish between rain and irrigation water splash.
- Sensing pad surface needs periodic cleaning.
- Not weatherproof (module board must be shielded, only the pad exposed).
