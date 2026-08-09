# 🔌 AgriShield ESP32 — Hardware Connection List

**Version:** v2.1 Production Pinout  
**Board:** ESP32 Dev Module (30-Pin / 38-Pin)  
**Firmware:** `ArduinoTests/AgriShield_Main/AgriShield_Main.ino`

---

## 📌 Master GPIO Wiring Table

| Hardware Component | Component Pin | ESP32 GPIO Pin | Voltage | Function & Logic |
| :--- | :--- | :--- | :---: | :--- |
| **0.96" / 1.3" OLED Display** | SDA / SCL | GPIO 21 / 22 | 3.3V | I2C Display (Address `0x3C`) |
| | VCC / GND | 3.3V / GND | 3.3V | Power & Ground |
| **Push Switch (Button)** | Terminal 1 (Signal) | GPIO 25 *(or 13)* | 3.3V | Internal `INPUT_PULLUP` (5-Page Cycle: 1→2→3→4→5→1) |
| | Terminal 2 | GND | 0V | Ground |
| **LED 1: White LED** | Anode (+) via 220Ω | GPIO 2 | 3.3V | **Power ON Heartbeat:** Blinks 100ms every 5s |
| | Cathode (−) | GND | 0V | Ground |
| **LED 2: Green LED** | Anode (+) via 220Ω | GPIO 15 | 3.3V | **Wi-Fi Status:** Solid ON when connected |
| | Cathode (−) | GND | 0V | Ground |
| **LED 3: Blue LED** | Anode (+) via 220Ω | GPIO 16 | 3.3V | **Bluetooth Status:** Solid ON when paired to `AgriShield_Node_01` |
| | Cathode (−) | GND | 0V | Ground |
| **LED 4: Yellow LED** | Anode (+) via 220Ω | GPIO 12 | 3.3V | **Data Tx:** Flashes 100ms on telemetry upload |
| | Cathode (−) | GND | 0V | Ground |
| **LED 5: Orange LED** | Anode (+) via 220Ω | GPIO 27 | 3.3V | **Button Feedback:** Pulses 120ms on button press |
| | Cathode (−) | GND | 0V | Ground |
| **LED 6: Red Alert LED** | Anode (+) via 220Ω | GPIO 26 | 3.3V | **Fault Alarm:** Blinks when battery <20% or sensor fault |
| | Cathode (−) | GND | 0V | Ground |
| **AHT20 + BMP280 Combo Module** | VDD | 3.3V | 3.3V | Module Power Input (Red Wire) |
| *(Temp, Humidity & Pressure)* | GND | GND | 0V | Common Ground (Black Wire) |
| | SDA | GPIO 21 | 3.3V | Shared I2C Data Line (Yellow Wire) |
| | SCL | GPIO 22 | 3.3V | Shared I2C Clock Line (White Wire) |
| **BH1750 5-Pin Light Sensor** | VCC / GND | 3.3V / GND | 3.3V | Module Power & Ground |
| | SDA / SCL | GPIO 21 / 22 | 3.3V | Shared I2C Bus |
| | ADDR (ADD) | **GND** ⚠️ | 0V | Connect ADDR to GND to set I2C Address `0x23` |
| **Capacitive Soil Moisture** | AO (Analog Out) | GPIO 34 | 3.3V | ADC1_CH6 — Soil moisture analog input |
| | VCC / GND | 3.3V / GND | 3.3V | Power & Ground |
| **Rain Droplet Sensor** | AO (Analog Out) | GPIO 35 | 3.3V | ADC1_CH7 — Rain intensity analog input |
| | DO (Digital Out) | GPIO 33 | 3.3V | Digital rain detect (LOW = raining) |
| | VCC / GND | 3.3V / GND | 3.3V | Power & Ground |
| **18650 Battery Monitor** | Signal (S) | GPIO 32 | 3.3V | ADC1_CH4 — Battery voltage divider (10kΩ + 10kΩ) |
| | BAT+ / GND | BAT+ / GND | 0–4.2V | Battery voltage source |
| **TP4056 USB Charger** | STAT / CHRG | GPIO 14 | 3.3V | Charging status input (LOW = charging) |
| **MicroSD Card Module** | CS (Chip Select) | GPIO 5 | 3.3V | SPI Chip Select |
| | SCK (Clock) | GPIO 18 | 3.3V | SPI Clock |
| | MOSI (Data In) | GPIO 23 | 3.3V | SPI Master Out / Slave In |
| | MISO (Data Out) | GPIO 19 | 3.3V | SPI Master In / Slave Out |
| | VCC | **5V (VIN)** ⚠️ | **5V** | Must use 5V — module has onboard regulator |
| | GND | GND | 0V | Ground |

---

## 📋 Quick GPIO Reference

| GPIO | Assignment | Direction |
| :---: | :--- | :---: |
| 2 | LED 1 — White (Heartbeat) | OUTPUT |
| 5 | MicroSD CS | OUTPUT |
| 12 | LED 4 — Yellow (Data Tx) | OUTPUT |
| 13 | Push Button (Backup) | INPUT |
| 14 | TP4056 Charge Status | INPUT |
| 15 | LED 2 — Green (Wi-Fi) | OUTPUT |
| 16 | LED 3 — Blue (Bluetooth) | OUTPUT |
| 17 | DHT22 Data | INPUT |
| 18 | MicroSD SCK | OUTPUT |
| 19 | MicroSD MISO | INPUT |
| 21 | I2C SDA (OLED, BMP, BH, AHT) | I/O |
| 22 | I2C SCL (OLED, BMP, BH, AHT) | OUTPUT |
| 23 | MicroSD MOSI | OUTPUT |
| 25 | Push Button (Primary) | INPUT |
| 26 | LED 6 — Red (Alert) | OUTPUT |
| 27 | LED 5 — Orange (Page Switch) | OUTPUT |
| 32 | Battery Voltage ADC | INPUT |
| 33 | Rain Digital DO | INPUT |
| 34 | Soil Moisture AO | INPUT |
| 35 | Rain Analog AO | INPUT |

---

> 💾 **MicroSD Note:** Card must be formatted as **FAT32** (32KB cluster) before use.  
> ⚠️ **Pin Change Log:** LED 3 (Blue) moved from GPIO 4 → GPIO 16. DHT22 moved from GPIO 4 → GPIO 17. This resolved the 10-second watchdog reset bug.
