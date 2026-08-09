#include "LanguageManager.h"
#include "Config.h"

DisplayLang LanguageManager::_currentLang = DisplayLang::EN;

void LanguageManager::setLanguage(DisplayLang lang) {
    _currentLang = lang;
}

void LanguageManager::setLanguageByCode(String code) {
    code.toLowerCase();
    if (code == "hi") _currentLang = DisplayLang::HI;
    else if (code == "te") _currentLang = DisplayLang::TE;
    else if (code == "ta") _currentLang = DisplayLang::TA;
    else _currentLang = DisplayLang::EN;
}

DisplayLang LanguageManager::getLanguage() {
    return _currentLang;
}

String LanguageManager::getText(String key) {
    if (_currentLang == DisplayLang::HI) {
        if (key == "Temp") return "Taapmaan";
        if (key == "Hum") return "Aardrata";
        if (key == "Light") return "Prakash";
        if (key == "Soil") return "Mitti";
        if (key == "Rain") return "Varsha";
        if (key == "Pressure") return "Daab";
        if (key == "Voltage") return "Volt";
        if (key == "Charge") return "Bhatti";
        if (key == "Status") return "Sthiti";
        if (key == "Health") return "Swasth";
        if (key == "Connecting") return "WiFi Jod Rahe";
        if (key == "Connected") return "WiFi Jod Gaya!";
        if (key == "CLEAR") return "SAAF";
        if (key == "RAINING") return "BAARISH";
        if (key == "DISCHARGING") return "DISCHARGE";
        if (key == "CHARGING") return "CHARGING";
    }
    else if (_currentLang == DisplayLang::TE) {
        if (key == "Temp") return "Ushnograta";
        if (key == "Hum") return "Thema";
        if (key == "Light") return "Kanthi";
        if (key == "Soil") return "Nela";
        if (key == "Rain") return "Varsham";
        if (key == "Pressure") return "Peedanam";
        if (key == "Voltage") return "Volt";
        if (key == "Charge") return "Charge";
        if (key == "Status") return "Sthithi";
        if (key == "Health") return "Arogyam";
        if (key == "Connecting") return "WiFi Kaluputondi";
        if (key == "Connected") return "WiFi Kalusukundi!";
        if (key == "CLEAR") return "SUBHARAM";
        if (key == "RAINING") return "VARSHAM";
        if (key == "DISCHARGING") return "DISCHARGE";
        if (key == "CHARGING") return "CHARGING";
    }
    else if (_currentLang == DisplayLang::TA) {
        if (key == "Temp") return "Veppam";
        if (key == "Hum") return "Eram";
        if (key == "Light") return "Oli";
        if (key == "Soil") return "Man";
        if (key == "Rain") return "Mazhai";
        if (key == "Pressure") return "Azhuttham";
        if (key == "Voltage") return "Volt";
        if (key == "Charge") return "Charge";
        if (key == "Status") return "Nilai";
        if (key == "Health") return "Arokyam";
        if (key == "Connecting") return "WiFi Inaikirathu";
        if (key == "Connected") return "WiFi Inaenthatu!";
        if (key == "CLEAR") return "CLEAR";
        if (key == "RAINING") return "MAZHAI";
        if (key == "DISCHARGING") return "DISCHARGE";
        if (key == "CHARGING") return "CHARGING";
    }
    
    // Default English
    return key;
}
