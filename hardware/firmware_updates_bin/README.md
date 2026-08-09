# Firmware Updates (.bin) Directory

This folder is designed to hold your compiled **Firmware Binary (.bin)** files. 

Whenever you make changes to your ESP32 Arduino code and export the compiled binary, you should save it in this folder. This acts as an archive so you can keep a history of the exact firmware files you have deployed to your field hardware.

### How to use this folder:
1. Open your code in the Arduino IDE (e.g., `AgriShield_Main.ino`).
2. Make your necessary code changes.
3. Update the firmware version variable in your code (e.g., `#define FIRMWARE_VERSION "v2.6.0"`).
4. Click **Sketch -> Export compiled Binary**.
5. Move the generated `.bin` file into this `firmware_updates_bin` folder.
6. Rename the file so it is easy to track (for example: `ESP32_AgriShield_v2.6.0.bin`).
7. Open your Admin Control Panel in the web browser, go to **Firmware & OTA Updates**, and upload the file from this folder!

> **Note:** Do not put raw `.ino` or `.cpp` code files in here. This folder is strictly for compiled `.bin` files ready for Over-The-Air (OTA) deployment.
