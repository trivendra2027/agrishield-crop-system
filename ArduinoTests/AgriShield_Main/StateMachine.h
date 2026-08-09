#pragma once
enum class DeviceState {
    BOOT, INIT, WIFI_CONNECTING, READY, OFFLINE, ERROR_STATE, OTA, SHUTDOWN
};
extern DeviceState currentState;
