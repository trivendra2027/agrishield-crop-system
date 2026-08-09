#pragma once
#include <Arduino.h>

enum class DisplayLang {
    EN, // English
    HI, // Hindi (Transliterated)
    TE, // Telugu (Transliterated)
    TA  // Tamil (Transliterated)
};

class LanguageManager {
public:
    static void setLanguage(DisplayLang lang);
    static void setLanguageByCode(String code);
    static DisplayLang getLanguage();
    static String getText(String key);

private:
    static DisplayLang _currentLang;
};
