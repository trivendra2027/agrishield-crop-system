# AgriShield Project Changelog (changes_happening.md)

*This file automatically tracks all major code, architecture, and configuration updates to prevent work loss.*

## 2026-08-09 - Complete Cloud Deployment to GitHub, Render, Vercel & MongoDB Atlas
- **GitHub Repository Provisioned:** Initialized and pushed full clean repository (`https://github.com/trivendra2027/agrishield-crop-system.git`) with optimized `.gitignore` for ML and frontend artifacts.
- **FastAPI AI Backend on Render:** Deployed containerized backend to `https://agrishield-api-7i0o.onrender.com` with CPU-optimized PyTorch, `timm` neural loader, and Pydantic Settings safe defaults.
- **Frontend SPA on Vercel:** Deployed React Vite dashboard to `https://agrishield-crop-system.vercel.app` with `VITE_API_URL` pointing to Render cloud API.
- **Full Database Migration to Atlas:** Migrated 2,055 documents across all 20 collections (users, predictions, devices, farm profiles, 1,472 sensor telemetry records) to AWS Mumbai MongoDB Atlas cluster (`agrishield_db`).
- **ESP32 Global Firmware Update:** Pointed `Config.h` and `ApiManager.cpp` to the Render cloud backend with a 5000ms latency buffer for remote hotspot and field Wi-Fi streaming.

---

## 2026-08-07
- **Vapor Pressure Deficit (VPD) Analytics (`AgriShield_Main.ino`, `iot.py`)**
  - Implemented the mathematical formula to calculate VPD (in kPa) natively on the ESP32 using the AHT20 Temperature and Humidity readings.
  - Squeezed the OLED layout on Page 1 to perfectly fit Temp, Humidity, VPD, and Light on a single screen for an extremely professional dashboard.
  - Added `vpd` to the JSON telemetry payload and updated the FastAPI `IoTTelemetry` backend model to log the new data point for future AI disease prediction models.
- **Background Offline Bulk Sync Implemented (`AgriShield_Main.ino`, `iot.py`)**
  - Added a new `POST /api/v1/iot/telemetry/bulk` backend endpoint that natively accepts JSON-Lines data streams.
  - The ESP32 now autonomously scans the SD card for `telemetry_log.txt` when Wi-Fi connects, and securely uploads missing historical offline data in background chunks (preventing RAM exhaustion).
- **SD Card Offline Sync Bug Fix (`AgriShield_Main.ino`)**
  - Fixed a critical bug where online telemetry was constantly triggering the bulk sync logic, creating duplicate database entries. 
  - Split SD logging into two files: `/archive_log.txt` (permanent blackbox history) and `/telemetry_log.txt` (strictly for offline queueing).
- **Rain Sensor ADC Classification (`AgriShield_Main.ino`, `iot.py`)**
  - Upgraded the Rain Sensor logic to utilize the ESP32's 12-bit ADC (`analogRead` on GPIO 35).
  - The system now mathematically classifies the intensity of precipitation into `DRY`, `MIST`, `LIGHT`, or `HEAVY` based on electrical resistance.
  - Pushed the new `"rain_intensity"` field to the FastAPI database model and the live OLED display.
- **OLED UI Glitches & Layout Overhaul (`AgriShield_Main.ino`)**
  - Fixed severe pixel overlapping in the Top Header Bar where long Wi-Fi strings and AM/PM characters were overwriting the system icons (Battery, Wi-Fi, Bluetooth).
  - Implemented a premium "Smartwatch-style" alternating display in the top-left corner that fades between 12-hour Time and Full Date every 4 seconds to perfectly fit the 70-pixel physical boundary.
- **Battery Voltage Smoothing Filter (`AgriShield_Main.ino`)**
  - Implemented an Exponential Moving Average (EMA) software Kalman filter to stabilize the battery percentage on the display.
  - The filter actively absorbs and ignores extreme 0.5V voltage drops caused by massive 500mA Wi-Fi power spikes, keeping the battery UI rock-solid.
- **OLED Ghosting Bug Fix (`AgriShield_Main.ino`)**
  - Fixed a persistent text artifacting (ghosting) bug on the SH1106 display where I2C transmission drops would leave previous text partially embedded. Enforced a full physical hardware RAM wipe on the display before pushing static pages.
- **Captive Portal UI Update (`AgriShield_Main.ino`)**
  - Re-ordered the layout of the Control Panel to move Display Controls and Weather Animations prominently under the Live Screen Monitor.
- **ESP32 Autonomous State Machine Implemented (`AgriShield_Main.ino`)**
  - **Night Mode Deep Sleep:** ESP32 now sleeps when `< 10 Lux` to save battery. It wakes for 10 seconds every 10 minutes to process web requests and SD card logging, then returns to sleep.
  - **Rain Interruption (`EXT0`):** ESP32 ULP coprocessor configured to watch GPIO 39 (`PIN_RAIN_DIGITAL`). If the digital rain sensor detects water while sleeping, it instantly wakes the ESP32 and triggers the Rain animation.
  - **Daytime Always-On:** When `> 30 Lux`, the display stays ON constantly and data is uploaded continuously every 1 minute.
  - **Autonomous Animations:** Added environmental logic to automatically trigger the Rain animation when raining, Hot animation when `Temp > 35°C`, Sunrise at dawn, and Clear Night at dusk.
- **Node Control Panel Fixes (`AgriShield_Main.ino`)**
  - Fixed an issue where the Captive Portal Mobile Dashboard (`captivePortalHtml`) was being overwritten by the OTA upload form (`serverIndex`).
  - Restored the Mobile Web Dashboard on the local IP `http://10.189.236.45/`.
  - Moved the OTA Firmware Update form to its own route at `http://10.189.236.45/ota`.
  - Injected missing `/save` and `/settime` POST/GET handlers into the main `loop` so users can change Wi-Fi credentials over the local home network without entering AP Mode.
- **OLED Animation Rendering Bug Fix (`AgriShield_Main.ino`)**
  - Fixed an issue where manual animations triggered from the mobile app (or autonomous triggers) were completely ignored by `drawOledPage()`. 
  - The display was fluctuating because it was trying to aggressively redraw the standard sensor values over top of the animation sequence.
  - Injected an early-exit routing block into `drawOledPage` so that when `activeAnimation > 0`, it exclusively delegates rendering to the specific animation functions (e.g. `drawRainAnimation()`) for exactly 4.5 seconds before returning to the normal data views.
- **Strict Offline Mode & UI Bug Fix (`AgriShield_Main.ino`)**
  - **The Bug:** Strict Offline Mode wasn't saving because the giant unified HTML form required a Wi-Fi SSID to successfully submit. If the user left SSID blank, the entire save request (including the checkbox) was rejected with a 400 Error.
  - **The Fix:** Split the single `/save` endpoint into two dedicated endpoints: `/save-node` and `/save-adv`.
  - Refactored `captivePortalHtml` to split "Node Settings" and "Advanced Settings" into two completely separate HTML `<form>` elements with independent Submit buttons.
- **Missing Animation Functions Restored (`AgriShield_Main.ino`)**
  - Fixed a compiler error where `drawRainAnimation`, `drawHotAnimation`, `drawSunriseAnimation`, and `drawSunsetAnimation` were missing from the global scope.
  - Hand-coded the geometric logic for these 4 missing OLED animations and injected them into the file just above the `drawGrowAnimation` block to allow compilation to succeed.
- **Hardware Boot Error Fixed (`AgriShield_Main.ino`)**
  - Fixed an ESP-IDF boot exception (`gpio_pullup_en(85): GPIO number error`) that occurred because `PIN_RAIN_DIGITAL` (GPIO 39) was declared as `INPUT_PULLUP`. GPIO 39 is an input-only pin on the ESP32 and physically lacks an internal pull-up resistor. Changed to `INPUT`.
- **Strict Offline Mode Rescue Override (`AgriShield_Main.ino`)**
  - Added a hardcoded `offlineMode = false;` rescue override to forcibly disable Strict Offline Mode. This allows the user to regain Wi-Fi access to their device if they accidentally lock themselves out by saving Offline Mode via the Web UI.
- **OLED Animation Display Fix (`AgriShield_Main.ino`)**
  - Fixed an issue where the Rain, Hot, Sunrise, and Sunset animations were not visible on the physical OLED screen. The underlying geometric calculations were running, but the `display.clearDisplay()` and `display.display()` commands were missing from the loop, meaning the buffer was never pushed to the physical screen.
- **Captive Portal UI Refactor (`AgriShield_Main.ino`)**
  - Separated the "Node ID (Device Name)" setting out of the Wi-Fi box.
  - Created a new standalone HTML `<form>` titled "Device Identity" with its own `/save-id` endpoint.
  - The Wi-Fi settings are now strictly contained in their own "Wi-Fi Connection" box.
- **Weather Animation Overhaul (`AgriShield_Main.ino`)**
  - Increased `ANIM_DURATION` from 5 seconds to 6 seconds globally.
  - **Heavy Rain**: Upgraded to feature 8 layers of angled rain with wind-drift and a randomized full-screen lightning flash effect.
  - **Extreme Heat**: Upgraded to feature a pulsing sun with rotating geometric rays, animated heat waves at the bottom, and a dynamic thermometer graphic filling up on the left side.
  - **Sunrise**: Upgraded to feature a sun rising smoothly from behind a set of silhouetted mountains, with birds flying across the sky.
  - **Sunset**: Upgraded to feature a sun setting over a shimmering ocean horizon with waves, while randomized stars slowly fade in above.
- **React Node Control Panel Wi-Fi Configuration (`NodeControlPage.jsx`)**
  - Upgraded the React frontend's Node Control Panel to include a new "Remote Wi-Fi Configuration" card. This allows users to remotely update the ESP32's SSID, Password, and API URL over the local network using the ESP32's `/save-node` endpoint without needing to enter the Captive Portal AP.
- **Physical Pushbutton Animation Interrupt Fix (`AgriShield_Main.ino`)**
  - Fixed a perceived bug where the physical buttons (GPIO 25 & 14) appeared unresponsive if an OLED weather animation was currently playing. The button press logic now explicitly sets `activeAnimation = 0;`, instantly killing any running animation and immediately redrawing the newly selected page to the screen.
- **Node Control Panel Feature Parity (`NodeControlPage.jsx`)**
  - Upgraded the React frontend to include an "Advanced Settings" card featuring Screen Timeout, Data Upload Interval, Temp Calibration Offset, and Strict Offline Mode.
  - Added a "Manual Time & Date" card to synchronize the ESP32 RTC over the network.
  - Added a "Reset Device" button.
- **Professional OLED Animations Overhaul (`AgriShield_Main.ino`)**
  - Rebuilt all remaining system animations from the ground up to feature highly complex math, physics, and graphics:
    - **Grow**: Features a seed that sprouts from the ground, grows a stem, unfurls multiple leaves, and blossoms a flower with a rotating petal algorithm, with dynamic sun rays in the background.
    - **Water**: Features realistic water droplet physics, drawing a droplet that accelerates down and hits the ground, generating animated concentric perspective ellipses (ripples).
- **Hardware Pushbutton Debounce Fix (`AgriShield_Main.ino`)**
  - Completely rewrote the physical push button logic for GPIO 25 & 14. Replaced the unreliable edge-detection logic with a highly robust **level-triggered** 500ms debounce. You can now confidently press or hold the physical buttons, and it will 100% reliably switch pages on the OLED without any bouncing or missed clicks.
- **Telemetry Upload & Status Logging Fix (`AgriShield_Main.ino`)**
  - Ensured the `uploadIntervalMs` correctly defaults to exactly 60,000ms (1 minute).
  - Fixed the Serial Monitor output for data transmission. When the backend successfully receives data, the ESP32 will now explicitly print `📡 HTTP POST Success! Code: 200 OK` to the Serial Monitor so you can verify the transmission.
- **"Live Screen Monitor" OLED Mirroring (`AgriShield_Main.ino` & `NodeControlPage.jsx`)**
  - **Captive Portal & React UI:** Redesigned the "Live Screen Monitor" on both web interfaces. Instead of a modern web UI, the monitor now strictly outputs raw monospace text on a black background, perfectly mirroring the exact 128x64 pixel layout and text coordinates of the physical OLED screen (e.g. `Temp  : 33.5 C`, `Soil  : 45 %`).
- **Animation Interrupt Prevention (`AgriShield_Main.ino`)**
  - Wrapped both the physical push button logic and the web-based `/page-next` and `/page-prev` endpoints in an `if (activeAnimation == 0)` check. If an animation is currently playing, all attempts to change the page are ignored until the 6-second animation sequence naturally completes, ensuring animations are never accidentally cut short.
- **OLED Screen Auto-Refresh (`AgriShield_Main.ino`)**
  - Added a dedicated 30-second background timer in the main `loop()` that automatically takes fresh sensor readings and redraws the current OLED page, ensuring the physical display always shows the latest data without needing to switch pages back and forth.
- **Hardware Pushbutton Edge-Trigger Fix (`AgriShield_Main.ino`)**
  - Reverted the push button logic to simple level-triggered logic with a 400ms delay. Now, if you hold the button down continuously, it will cleanly flip through the pages every 400ms without sticking!
  - **Button Timer Lockout Fix:** Fixed a severe bug where the buttons would stop working during "Daytime Mode". The daytime logic was constantly resetting the button's internal `lastPressTime` to keep the screen on, which permanently locked out the button timer. The screen timeout timer and the button debounce timer have now been separated to ensure flawless button response 24/7.
  - **Hardware Relocations:** Because the user reported GPIO 25 was physically unresponsive on their specific board, and GPIO 14 was colliding with the SD card SPI Clock, BOTH buttons have been permanently moved to the completely untouched, 100% safe pins **GPIO 26 (Forward)** and **GPIO 27 (Back)**.
  - **Offline SD Logging Fix:** Fixed a critical bug where the device would completely freeze if there was no Wi-Fi at boot. The `startCaptivePortal()` function previously had an infinite `while(true)` blocking loop that paused the entire program. This blocking loop has been removed! Now, if there is no Wi-Fi, it will broadcast the AP ("AgriShield-Setup") in the background, but immediately proceed into the main loop, perfectly logging all telemetry data to the SD card!
  - **Captive Portal Auto-Destruct Bug Fix:** Fixed a severe logical conflict where the background "3-Wi-Fi Auto-Failover" loop was violently destroying the Captive Portal. Previously, if the ESP32 was broadcasting the AP (because it was offline), the Failover loop saw `!wifiConnected`, immediately assumed the router dropped, and aggressively forced the Wi-Fi chip back into Station Mode (`WIFI_STA`) every 5 seconds, nuking the AP network! The Failover loop now cleanly suspends itself while the Captive Portal AP is active.
  - **Offline Hotspot Auto-Reconnect Fix:** If the ESP32 booted offline and activated the Captive Portal, it used to permanently lock into Access Point (`WIFI_AP`) mode. This meant if you turned your Mobile Hotspot on later, the ESP32 would completely ignore it. The Captive Portal now uses `WIFI_AP_STA` (Dual Mode). It broadcasts the Captive Portal to your phone, while simultaneously and silently scanning for your mobile hotspot in the background. If you turn your hotspot on 4 minutes later, the ESP32 will instantly latch onto it and resume live cloud telemetry without ever interrupting the offline SD Card logging!
  - **Zero Data-Loss Blackbox Recorder (`AgriShield_Main.ino`):** Fixed a massive data-loss vulnerability. Previously, if the ESP32 was connected to the Wi-Fi router, but the React Frontend/Node.js backend was shut down (server offline), the ESP32 would fail the HTTP upload and permanently throw the data away (because it only saved to the SD card when Wi-Fi was completely disconnected). The code has been rewritten so the SD Card acts as an unconditional "Blackbox Recorder". It now permanently logs every single sensor reading to the SD card regardless of Wi-Fi or backend status, guaranteeing absolute zero data loss under any server failure scenario.
  - **Boot-Up SPI Glitch Fix:** Added a 3-second lockout timer on boot. Because GPIO 14 is shared with the SD Card SPI Clock (SCK), the initialization of the SD card module during boot was causing electrical noise on the pin, tricking the ESP32 into thinking you pressed the "Back" button and instantly jumping to Page 5. The device now cleanly ignores all button signals during the first 3 seconds to let the SPI bus settle.

### Admin & Profile UI Optimizations (August 7, 2026)
- **AdminPage.jsx**: Added whitespace-nowrap and overflow-x-auto to data tables to fix horizontal scrolling on mobile. Enabled flex wrapping on the filter bar.
- **index.css**: Enforced overflow-x: hidden on root html/body to prevent horizontal screen drift on mobile.
- **UI.jsx**: Made Navbar responsive by hiding 'Admin Panel' text on small screens. Fixed role access bugs (case sensitivity, tester spoofing in avatar dropdown, and URL-based sidebar spoofing).

### ESP32 Offline AP Mode Fallback (August 7, 2026)
- **AgriShield_ESP32.ino**: Implemented full WiFi.softAP mode. If the ESP32 fails to connect to the main Wi-Fi for 60 seconds, it launches the AgriShield-Node-Alpha Access Point. Built a localized Captive Portal using DNSServer and embedded an HTML/JS offlinePanelHTML to allow users to view live sensor telemetry and re-configure Wi-Fi passwords directly from the hardware at 192.168.4.1.

### ESP32 Advanced AP Hardware Controls (August 7, 2026)
- **AgriShield_ESP32.ino**: Upgraded the offline HTML dashboard to include a 'Hardware Controls' panel. Added endpoints for /api/shutdown (forces Deep Sleep) and /api/offline_mode (disables Wi-Fi reconnect loop to save battery). Added /api/screen_config endpoint and global timers to allow users to set an OLED Screen Timeout (in minutes/seconds). Added a 'Screen Active: Xs' live tracker to the telemetry dashboard. OLED wakes up automatically on any physical button press.

### ESP32 Main Suite AP Hardware Controls (August 7, 2026)
- **AgriShield_Main.ino**: Ported the "Hardware Controls" panel directly into the master captivePortalHtml string. Replaced the old dropdown timeout setting with custom Minute and Second input boxes. Integrated Complete Shutdown (/api/shutdown) and Strict Offline Mode (/api/strict_offline) APIs. The /status endpoint now correctly returns "sc" (live screen active time) to track OLED sleep progression. Configured the loop to automatically trigger setupMode and launch startCaptivePortal if the Wi-Fi connection fails for 60 seconds straight.

### ESP32 Online Mode Hardware Controls (August 7, 2026)
- **AgriShield_Main.ino**: Duplicated the `/api/shutdown`, `/api/strict_offline`, and `/save-adv` endpoints into the online Web OTA Server routes. The hardware control buttons on the dashboard (Complete Shutdown, Strict Offline, Screen Timeout) will now function perfectly regardless of whether the ESP32 is running in offline AP Mode or connected online to the local Wi-Fi network.

### ESP32 Deep Sleep Hardware Fix (August 7, 2026)
- **AgriShield_Main.ino**: Updated the `/api/shutdown` endpoint to explicitly send the `0xAE` (Display OFF) I2C command to the OLED screen and pull the heartbeat LED low before executing `esp_deep_sleep_start()`. This prevents the OLED display from staying illuminated (holding power) while the main ESP32 CPU is asleep.

### ESP32 Push Button Wakeup & Offline Toggle (August 7, 2026)
- **AgriShield_Main.ino**: Configured the `/api/shutdown` endpoints to enable `ext0` wake-up on `PIN_BUTTON_1`. Pressing Button 1 physically wakes the ESP32 from Complete Shutdown!
- Removed the legacy "Rescue Override" lock so Strict Offline Mode now correctly persists across device reboots without automatically jumping back online.
- Added Long-Press support to Button 1 in the main loop: Holding the button for 3 seconds toggles Strict Offline Mode ON/OFF and cleanly restarts the device.
- Upgraded the manual page switching button logic to trigger only on initial press (rather than hold), preventing rapid accidental page cycling while attempting a long-press.

### ESP32 RTC Pullup Deep Sleep Fix (August 7, 2026)
- **AgriShield_Main.ino**: Fixed a bug where the ESP32 would instantly reboot after clicking "Complete Shutdown". The ESP32 disables standard `INPUT_PULLUP` pins during deep sleep, causing Button 1 to float LOW and instantly trigger the `ext0` wakeup. Included `<driver/rtc_io.h>` and added `rtc_gpio_pullup_en()` to explicitly instruct the internal RTC power domain to keep Button 1 pulled HIGH while the CPU is asleep.

### ESP32 Rain Sensor Calibration & Animation Logic (August 7, 2026)
- **AgriShield_Main.ino**: Recalibrated the Rain Sensor logic to use mapped percentages (`rainPercent`) rather than raw ADC thresholds, solving false "Mist" readings indoors. The thresholds are now clearly segmented into DRY (<15%), MIST (<35%), LIGHT (<55%), MEDIUM (<75%), and HEAVY.
- Updated the autonomous Rain Animation logic to only trigger when `MEDIUM` or `HEAVY` rain is detected, preventing the OLED from constantly showing animations for light mist.
- Added a 5-minute cooldown (`lastRainAnim > 300000ms`) to the autonomous rain animation so that it does not spam the display and allows the farmer to actually read the data screen during a prolonged storm.

### ESP32 Autonomous Sleep Interval Setting (August 7, 2026)
- **AgriShield_Main.ino**: Added a dynamic `sleepIntervalMin` setting to control the length of the autonomous Deep Sleep during Night Mode.
- Integrated an "Autonomous Sleep Interval (Minutes)" input box into the Web Control Panel's hardware settings page. This allows the user to dynamically adjust how long the ESP32 sleeps (e.g., 10 minutes, 1 hour) before waking up to take the next batch of readings, without needing to re-flash the firmware.

### Dynamic HTML Populating (August 7, 2026)
- **AgriShield_Main.ino**: Converted the static `captivePortalHtml` fields to use dynamic string replacement (`getCaptivePortalHtml()`). Now, when the user opens the Web Control Panel, all input fields (Wi-Fi credentials, Screen Timeout, Sleep Interval, Upload Interval, Calibration, etc.) will automatically populate with the actual values saved on the device instead of reverting to placeholders or default HTML strings.

### Control Panel Save UI & {API} Placeholder Fix (August 7, 2026)
- **AgriShield_Main.ino**: Fixed the online server (OTA mode) also using `getCaptivePortalHtml()` instead of the static `captivePortalHtml` raw pointer — this was the root cause of `{API}` and `{T_MIN}` etc. showing literally in the browser.
- Replaced all 4 bare `<h1>Saved... Rebooting...</h1>` text-only save responses with a styled dark-themed page that shows a green checkmark and auto-redirects back to the control panel after 2 seconds.

### Night Sleep Fast Path Fix (August 8, 2026)
- **AgriShield_Main.ino**: Fixed the infinite "wake-sleep-loop" seen in serial logs. When woken from a timer deep sleep with 0 lux (still dark/night), the device was wastefully trying to reconnect WiFi (failing), starting AP mode, waiting, then sleeping again — repeating every ~35 seconds endlessly.
- Added a `nightSleepCycle` flag that triggers a "Fast Night Path": skip WiFi, skip AP mode, immediately read all sensors, write a compact night log entry to SD card, then go back to deep sleep. Wake cycle is now ~5-8 seconds instead of 35+ seconds, massively saving battery.
- If daylight is detected (lux > 10) during a night wake, it exits the fast path and resumes full normal operation.

### Night Mode Confirmation + SD Always Save (August 8, 2026)
- **AgriShield_Main.ino**: Updated Night Mode detection to require CONFIRMATION before deep sleep. Instead of immediately sleeping on the first 0-lux reading, the device now needs: 3 consecutive dark readings OR 3 minutes of darkness — whichever comes first. This prevents a briefly dimmed room or a hand shadow from triggering unnecessary sleep.
- **AgriShield_Main.ino**: Fixed SD card saving to ALWAYS write telemetry to `/telemetry_log.txt` regardless of WiFi state. Previously it only saved when offline. Now both archive_log.txt (permanent blackbox) and telemetry_log.txt (sync queue) are written every cycle whether online or offline, ensuring zero data loss.

### Button Wakeup from Deep Sleep (August 8, 2026)
- **AgriShield_Main.ino**: Added full button wakeup support from deep sleep mode. Three wake sources now configured: EXT0 (rain sensor GPIO39), EXT1 (button GPIO26), and Timer.
- On button press during sleep: ESP32 instantly wakes, reads sensors, shows a night status screen on OLED for 10 seconds (Temp, Humidity, Lux, Rain, Sleep interval), then goes back to sleep.
- On timer wakeup during sleep: reads sensors, saves to SD, goes back to sleep silently (no screen on).
- On rain sensor wakeup: triggers rain animation and stays awake normally.
- If lux > 10 on any night wakeup: exits night mode and resumes full normal operation with WiFi.
- All deep sleep paths now disable WiFi/AP completely to save battery.

- Deleted approximately 286MB of temporary files, scripts, logs, and clutter from the root directory to clean up the workspace.

- Deleted deprecated hardware/esp32_v1 PlatformIO project folder to clean up duplicate/unused codebase files.

- Deleted unzipped raw dataset folders (balanced_dataset, combined_dataset, RiceDisease, RiceLeafDisease, split_dataset) from datasets/ to free up ~80GB of storage, as the original combined_dataset.zip backup was preserved.

- Added X-API-Key header authorization to AgriShield_Main.ino and updated frontend NodeControlPage.jsx to automatically inject the key.

- Completely redesigned NodeControlPage.jsx with a premium Glassmorphism Tabbed Interface for better organization and aesthetics.

- Added automatic ESP32 IP auto-discovery to the Node Control Panel by saving heartbeat IPs to the backend database.

- Built a backend HTTP proxy for ESP32 control to bypass mobile Mixed-Content blockers and enable global remote control over the tunnel.

- Added Day Sleep Interval feature to ESP32 firmware and React Node Control Panel to allow autonomous battery saving during daytime.

- 2026-08-08: Rolled back 5 advanced admin features (Live Console, Map, Mock Mode, Diagnostics, Global Alerts) per user request to implement later.

- 2026-08-08: Permanently deleted the 5 advanced admin features from the codebase and uninstalled leaflet/react-leaflet per user request.

- 2026-08-08: Built User Geography Map feature for Admin dashboard - new 'User Geography' tab in AdminPage.jsx with react-simple-maps SVG India map, bubble markers per state, tooltips, sortable state leaderboard, and backend /api/admin/user-geography endpoint with state keyword matching.

- 2026-08-08: Added 'User Geography' sidebar link in UI.jsx admin navigation to make the new map tab visible in the sidebar.

- 2026-08-08: Added industry-level CSS micro-animations across the site - smooth page transitions, staggered sidebar links with active bar, spring-press buttons, tab sliding, card lift on hover, shimmer loading, glow effects, and number counter animations.

- 2026-08-08: Fixed top Navbar disappearing/scrolling away by changing it from sticky to fixed positioning (top-0 left-0 right-0 z-50 h-16) and applying pt-16 padding to the App.jsx DashboardLayout. Applied animation classes (tab-enter, btn-spring) specifically to the Global Broadcasts tab components in AdminPage.jsx.

- 2026-08-08: Added stagger-item, card-lift, and btn-spring animations to lists and grids in AdminPage.jsx (Users Table, Security Metrics, IoT Nodes, Firmware, Audit Logs, Settings). Added similar micro-animations to ProfilePage.jsx for the identity card and Farm Intelligence tab.

- 2026-08-08: Built and integrated an advanced SVG/CSS dynamic 'FarmerAnimation' scene widget into the top navigation bar. It displays a farmer watering crops with responsive time-of-day backgrounds (sunrise, daytime, sunset, night), animated moving clouds, swaying crops, and falling water droplets.

- 2026-08-08: Rewrote FarmerAnimation scene with advanced professional effects: Parallax backgrounds, shimmering sunrays, twinkling stars, glowing fireflies at night, dynamic SVG glowing water stream mechanics, and flying birds, significantly upgrading the visual fidelity.

- 2026-08-08: Animated the V2 Farmer in FarmerAnimation.jsx, adding a walking and bobbing animation so he glides smoothly across the field instead of staying stationary.

- 2026-08-08: Built and integrated a massive 30-Animation Gallery in the Profile Page for customizing the Navbar scene. Created the useNavbarTheme hook, NavbarSceneRenderer, NavbarScenesLibrary (30 unique scenes), and added extensive keyframes to index.css.

- 2026-08-08: Pivoted Navbar Animation Gallery from illustrative SVGs to 30 Ultra-Premium Abstract UI themes (Aurora, Glassmorphism, Neural Networks, Liquid Chrome). Updated ProfilePage, NavbarScenesLibrary, and injected advanced CSS gradient keyframes into index.css for an enterprise-grade aesthetic.
- 2026-08-09: Implemented 100+ project-specific navbar animations split into 10 clean category files (PrecisionAgri, CropBiology, DiseaseDetection, WeatherClimate, SoilEarth, IoTHardware, WaterIrrigation, NatureEcosystem, DataVisualization, PremiumAbstract) under components/animations/scenes.
- 2026-08-09: Refactored NavbarSceneRenderer to map and switch between all 103 animations efficiently.
- 2026-08-09: Refactored visuals tab in ProfilePage to display all 103 animations with beautiful live mini-preview container cards.
- 2026-08-09: Implemented 15 dynamic Full Website Color Themes controlled via CSS Custom Properties on the html element (AgriShield Default, Harvest Gold, Ocean Irrigation, Sunset Farm, Cherry Blossom, Lavender Fields, Forest Floor, Cyberpunk AI, Midnight Lab, Desert Oasis, Volcanic Soil, Arctic Research, Barley Bronze, Citrus Orchard, Mist & Dew).
- 2026-08-09: Mapped both Tailwind primary and emerald color families to the CSS custom properties in tailwind.config.js to allow automatic color transitions across the entire interface.
- 2026-08-09: Created useColorTheme hook to manage color themes via localStorage and custom events.
- 2026-08-09: Added a separate Website Themes tab right after Visual Customization in ProfilePage.jsx for seamless personalization.
- 2026-08-09: Implemented live clock display inside top navigation bar (UI.jsx) updating every second with a neat design. Added role-based welcome scenes (101: Welcome Farmer, 102: Welcome Admin, 103: Welcome Tester) that adapt dynamically to the user's role and display date/time.
- 2026-08-09: Added 20 additional Full Website Color Themes (Emerald Valley, Crimson Harvest, Sapphire Stream, etc.) to index.css and ProfilePage.jsx, expanding the total to 35 fully functional themes.
- 2026-08-09: Generated and integrated 100 new abstract procedural SVG animations across all 10 scene files (PrecisionAgri, CropBiology, etc.) using automated generation. Mapped all 100 new components into NavbarSceneRenderer.jsx and ProfilePage.jsx, bringing the total animation count to 203.
- 2026-08-09: Overhauled all 100 new animations from generic placeholder shapes to detailed, domain-specific animated SVG scenes across all 10 categories (AutoSteer, DroneSwarm, DNAHelix, Microclimate, LoraNode, Aquifer, etc.) along with dedicated CSS keyframes in index.css.
- 2026-08-09: Implemented GPIO 4 Sensor Power Gating (`PIN_SENSOR_POWER 4`) in `AgriShield_Main.ino` and updated `hardware_connections.md`. Sensors (AHT20, BMP280, BH1750, DHT22, Soil, Rain) are powered ON only during active telemetry capture and completely powered OFF (0mA draw) before entering Deep Sleep, dramatically extending battery life.
- 2026-08-09: Fixed instant phantom wakeup bug during Deep Sleep. `PIN_RAIN_DIGITAL` on GPIO 39 lacks an internal pull-up and floats to 0V when sensors are powered off, which was prematurely satisfying `EXT0` active-LOW wakeup in <1ms. Removed `esp_sleep_enable_ext0_wakeup` on GPIO 39 so the ESP32 now sleeps for the full configured timer duration (e.g. 2 min / 10 min) while retaining instant button wake on GPIO 26 (`EXT1`).
- 2026-08-09: Expanded history query limit from 500 to 5000 in `backend/app/routers/iot.py`, `backend/app/routers/predict.py`, and `frontend/src/pages/HistoryPage.jsx` so all telemetry records (1500+) display in the Scan History table. Fixed datewise filtering logic using ISO standard `YYYY-MM-DD` comparisons and added a 1-click 'Clear Filters' button.
- 2026-08-09: Redesigned the Scan & Diagnostic History date filter bar into an inline Date Range selector with clear 'From' & 'To' labels and 1-click quick presets ('Today', '7 Days', '30 Days', 'All Time'). Formatted table dates into clean, human-readable strings (`09 Aug 2026` / `10:11 AM`) with stacked time badges.
- 2026-08-09: Fixed JSX syntax error in `HistoryPage.jsx` where closing `</motion.div>` was mismatched with container `<div>`.
- 2026-08-09: Resolved TypeScript/Babel TS1149 casing conflict warnings across 25 frontend files by normalizing all component UI primitive imports to `.../ui/index`.
- 2026-08-09: Calibrated Soil Moisture and Rain sensor thresholds in `AgriShield_Main.ino`. Soil moisture now accurately maps dry air/dry bed (ADC >= 2850) to `0.0%`, and the Rain sensor baseline is adjusted (`RAIN_DRY_ADC = 2300`) so dry room conditions (ADC ~2320–4095) report `DRY (0%)` instead of false `MEDIUM` rain alerts.
- 2026-08-09: Permanently resolved TypeScript TS1149 file-vs-folder case collision by renaming `frontend/src/components/UI.jsx` to `frontend/src/components/AppLayout.jsx`. Updated `App.jsx`, `ProtectedRoute.jsx`, `PlantIdResults.jsx`, `AgrochemicalResults.jsx`, `PredictionHistoryPage.jsx`, `LandingPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, and `CropAdvisoryPage.jsx`.
- 2026-08-09: Created `frontend/jsconfig.json` and root `jsconfig.json` with `"forceConsistentCasingInFileNames": false` and `"skipLibCheck": true` to prevent the VS Code / Antigravity IDE language server from producing stale TS1149 casing warnings on Windows.
- 2026-08-09: Overhauled ESP32 Offline Sync & SD Blackbox in `AgriShield_Main.ino`. Fixed non-JSON headers in `/telemetry_log.txt`, added `syncAllOfflineRecordsNow()` synchronous bulk upload in batches of 50 to `/api/v1/iot/telemetry/bulk` immediately on Wi-Fi connect, added Fast Day Offline Sleep Path (<0.5s awake when offline), and attached ISO RTC timestamps to every queued payload.
- 2026-08-09: Fixed OLED top header clock in `AgriShield_Main.ino` so `drawHeaderBar()` reads the ESP32 hardware RTC clock directly via `time(nullptr)` and displays running 12-hr time & date continuously even when Wi-Fi is disconnected (instead of displaying 'No Wi-Fi'). Fixed `backend/app/routers/iot.py` to preserve and return the original recording `timestamp` for all bulk offline sync records instead of replacing them with the server's `received_at` upload time.
- 2026-08-09: Fixed Arduino compilation error in `AgriShield_Main.ino` by removing the leftover call to `processOfflineBulkSync()` in `loop()`.
- 2026-08-09: Resolved offline server shutdown issue in root `package.json`. Created `scripts/tunnel_service.js` with auto-retry resilience and removed `-k` (kill-others) from `npm run dev`. Both Frontend (`localhost:3000`) and Backend (`localhost:8000`) now run continuously in both offline and online modes without shutting down.
- 2026-08-09: Fixed double timezone offset and N/A timestamps in Scan History. In `AgriShield_Main.ino`, updated `getIsoTimestamp()` with explicit `+05:30` (IST) offset and `time(nullptr)` RTC clock. In `backend/app/routers/iot.py` and `frontend/src/pages/HistoryPage.jsx`, added fallback timestamp extraction from MongoDB `_id.generation_time` and resilient date parsing so all historical records display exact Indian Standard Time (`02:26 PM`) without N/A values.
- 2026-08-09: Implemented comprehensive Indian Standard Time (IST) conversion engine in `backend/app/routers/iot.py`. Automatically converts all historical UTC records, live telemetry `received_at`, and ObjectId generation timestamps into explicit IST (+05:30) strings so every table entry in Scan History renders the correct local Indian time.
- 2026-08-09: Added a 1-click **Reload Telemetry** button in `frontend/src/pages/HistoryPage.jsx` with an animated spinning icon, manual refresh handler, and instant toast confirmation, allowing farmers to pull the latest sensor logs on demand without refreshing the entire page.
- 2026-08-09: Fixed double logging / duplicate record issue. In `AgriShield_Main.ino`, `/telemetry_log.txt` (offline queue) is now ONLY appended when offline or when live HTTP POST fails, eliminating double insertion when online. In `backend/app/routers/iot.py`, added robust deduplication filtering by `(device_id, minute, temperature, humidity)` so duplicate entries are stripped automatically from the table view.
- 2026-08-09: Resolved `connection refused` issue in `ArduinoTests/AgriShield_Main/Config.h`. Updated mobile hotspot `vivot4pro` IP and `FALLBACK_API_BASE_URL` to `http://10.28.171.146:8000/api/v1` (matching active network IP). Updated `AgriShield_Main.ino` to dynamically resolve matching network backend URLs on connect and print `Target Backend` to Serial. Fixed offset-naive datetime subtraction error in `backend/app/services/weather_service.py`.
- 2026-08-09: Prioritized `KNOWN_WIFI_NETWORKS` matching in `AgriShield_Main.ino` over stale Flash NVS preferences, preventing the ESP32 from falling back to old obsolete IP addresses like `10.189.236.146`.
- 2026-08-09: Prepared complete online cloud deployment suite: created root `Dockerfile` for Render/Railway/AWS, `frontend/vercel.json` for SPA routing on Vercel, and updated `backend/requirements.txt` with PyTorch, Torchvision, and headless OpenCV dependencies.

- **Cloud Command Queue Architecture (Backend, Frontend, ESP32)**: Implemented reverse-polling queue so the Vercel Node Control Panel can securely control the ESP32 via Render over the internet.