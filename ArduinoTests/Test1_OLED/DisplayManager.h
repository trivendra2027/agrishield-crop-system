#pragma once
#include <Arduino.h>

class DisplayManager {
public:
    static bool init();
    static void update();
    
private:
    static void drawProfessionalTheme(int page);
    static void handleAutoRotation();
    
    static void showBoot();
    static void showDashboard();
    static void showNetwork();
    static void showStorage();
    static void showDiagnostics();
    static void showDeviceInfo();
};
