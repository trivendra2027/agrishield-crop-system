from datetime import timezone
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Predefined templates dictionary for key localized warnings
NOTIFICATION_TEMPLATES: Dict[str, Dict[str, str]] = {
    "soil_moisture_low": {
        "en": "Soil moisture dropped to {{soil_moisture}}%. Recommended irrigation: {{liters}} L/m².",
        "hi": "मिट्टी की नमी गिरकर {{soil_moisture}}% हो गई है। अनुशंसित सिंचाई: {{liters}} लीटर/वर्ग मीटर।",
        "te": "నేలలో తేమ {{soil_moisture}}% కి పడిపోయింది. సిఫార్సు చేయబడిన నీటి పారుదల: {{liters}} లీటర్లు/చదరపు మీటరు.",
        "ta": "மண்ணின் ஈரப்பதம் {{soil_moisture}}% ஆக குறைந்துள்ளது. பரிந்துரைக்கப்பட்ட பாசனம்: {{liters}} லிட்டர்/சதுர மீட்டர்.",
        "kn": "ಮಣ್ಣಿನ ತೇವಾಂಶವು {{soil_moisture}}% ಕ್ಕೆ ಇಳಿದಿದೆ. ಶಿಫಾರಸು ಮಾಡಲಾದ ನೀರಾವರಿ: {{liters}} ಲೀಟರ್/ಚದರ ಮೀಟರ್.",
        "ml": "മണ്ണിലെ ഈർപ്പം {{soil_moisture}}% ആയി കുറഞ്ഞു. ശുപാർശ ചെയ്യുന്ന നനവ്: {{liters}} ലിറ്റർ/ചതുരശ്ര മീറ്റർ."
    },
    "soil_moisture_high": {
        "en": "Soil moisture is excessively high at {{soil_moisture}}%. Avoid additional irrigation.",
        "hi": "मिट्टी की नमी {{soil_moisture}}% पर अत्यधिक है। अतिरिक्त सिंचाई से बचें।",
        "te": "నేలలో తేమ {{soil_moisture}}% వద్ద చాలా ఎక్కువగా ఉంది. అదనపు నీటి పారుదల నివారించండి.",
        "ta": "மண்ணின் ஈரப்பதம் {{soil_moisture}}% மிக அதிகமாக உள்ளது. கூடுதல் பாசனத்தைத் தவிர்க்கவும்.",
        "kn": "ಮಣ್ಣಿನ ತೇವಾಂಶವು {{soil_moisture}}% ರಷ್ಟು ಹೆಚ್ಚಾಗಿದೆ. ಹೆಚ್ಚುವರಿ ನೀರಾವರಿಯನ್ನು ತಪ್ಪಿಸಿ.",
        "ml": "മണ്ണിലെ ഈർപ്പം {{soil_moisture}}% വളരെ കൂടുതലാണ്. കൂടുതൽ നനയ്ക്കുന്നത് ഒഴിവാക്കുക."
    },
    "temperature_high": {
        "en": "High temperature of {{temperature}}°C detected. Heat stress danger; increase irrigation.",
        "hi": "{{temperature}}°C का उच्च तापमान पाया गया। गर्मी का तनाव; सिंचाई बढ़ाएं।",
        "te": "అధిక ఉష్ణోగ్రత {{temperature}}°C నమోదైంది. వేడి ఒత్తిడి ముప్పు; నీటి పారుదల పెంచండి.",
        "ta": "உயர் வெப்பநிலை {{temperature}}°C கண்டறியப்பட்டுள்ளது. வெப்ப அழுத்தம்; பாசனத்தை அதிகரிக்கவும்.",
        "kn": "ಹೆಚ್ಚಿನ ತಾಪಮಾನ {{temperature}}°C ಪತ್ತೆಯಾಗಿದೆ. ಶಾಖದ ಒತ್ತಡದ ಅಪಾಯ; ನೀರಾವರಿ ಹೆಚ್ಚಿಸಿ.",
        "ml": "ഉയർന്ന താപനില {{temperature}}°C രേഖപ്പെടുത്തി. ചൂട് സമ്മർദ്ദം; നനവ് കൂട്ടുക."
    },
    "humidity_high": {
        "en": "Humidity is {{humidity}}%. Fungal disease transmission risk increased.",
        "hi": "आर्द्रता {{humidity}}% है। फंगल रोग के प्रसार का खतरा बढ़ गया है।",
        "te": "గాలిలో తేమ {{humidity}}% గా ఉంది. శిలీంధ్ర వ్యాప్తి ముప్పు పెరిగింది.",
        "ta": "ஈரப்பதம் {{humidity}}% ஆக உள்ளது. பூஞ்சை நோய் பரவும் அபாயம் அதிகரித்துள்ளது.",
        "kn": "ಆರ್ದ್ರತೆ {{humidity}}% ಆಗಿದೆ. ಶಿಲೀಂಧ್ರ ರೋಗ ಹರಡುವ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ.",
        "ml": "അന്തരീക്ഷ ഈർപ്പം {{humidity}}% ആണ്. പൂപ്പൽ രോഗ സാധ്യത കൂടുതലാണ്."
    },
    "battery_low": {
        "en": "ESP32 node battery level is low ({{battery_percentage}}%). Recharge device soon.",
        "hi": "ESP32 नोड बैटरी स्तर कम ({{battery_percentage}}%) है। जल्द ही डिवाइस चार्ज करें।",
        "te": "ESP32 నోడ్ బ్యాటరీ స్థాయి తక్కువగా ఉంది ({{battery_percentage}}%). త్వరలో పరికరాన్ని రీఛార్జ్ చేయండి.",
        "ta": "ESP32 நோடு பேட்டரி அளவு குறைவாக உள்ளது ({{battery_percentage}}%). சாதனத்தை விரைவில் சார்ஜ் செய்யவும்.",
        "kn": "ESP32 ನೋಡ್ ಬ್ಯಾಟರಿ ಮಟ್ಟ ಕಡಿಮೆಯಾಗಿದೆ ({{battery_percentage}}%). ಶೀಘ್ರದಲ್ಲೇ ಸಾಧನವನ್ನು ರೀಚಾರ್ಜ್ ಮಾಡಿ.",
        "ml": "ESP32 നോഡ് ബാറ്ററി ലെവൽ കുറവാണ് ({{battery_percentage}}%). ഉപകരണം ഉടൻ ചാർജ് ചെയ്യുക."
    },
    "battery_critical": {
        "en": "ESP32 node battery is critically low ({{battery_percentage}}%). Recharge immediately.",
        "hi": "ESP32 नोड बैटरी गंभीर रूप से कम ({{battery_percentage}}%) है। तुरंत चार्ज करें।",
        "te": "ESP32 నోడ్ బ్యాటరీ చాలా తక్కువగా ఉంది ({{battery_percentage}}%). వెంటనే రీఛార్జ్ చేయండి.",
        "ta": "ESP32 நோடு பேட்டரி மிக மிக குறைவாக உள்ளது ({{battery_percentage}}%). உடனடியாக சார்ஜ் செய்யவும்.",
        "kn": "ESP32 ನೋಡ್ ಬ್ಯಾಟರಿ ಮಟ್ಟ ಅತ್ಯಂತ ಕಡಿಮೆಯಾಗಿದೆ ({{battery_percentage}}%). ತಕ್ಷಣ ರೀಚಾರ್ಜ್ ಮಾಡಿ.",
        "ml": "ESP32 നോഡ് ബാറ്ററി അതീവ ഗുരുതര നിലയിലാണ് ({{battery_percentage}}%). ഉടൻ ചാർജ് ചെയ്യുക."
    },
    "device_offline": {
        "en": "Device {{device_id}} is offline. Last seen {{minutes}} minutes ago.",
        "hi": "डिवाइस {{device_id}} ऑफ़लाइन है। अंतिम बार {{minutes}} मिनट पहले देखा गया था।",
        "te": "పరికరం {{device_id}} ఆఫ్‌లైన్‌లో ఉంది. చివరిగా {{minutes}} నిమిషాల క్రితం కనిపించింది.",
        "ta": "சாதனம் {{device_id}} ஆஃப்லைனில் உள்ளது. கடைசியായി {{minutes}} நிமிடங்களுக்கு முன்பு பார்க்கப்பட்டது.",
        "kn": "ಸಾಧನ {{device_id}} ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಕೊನೆಯದಾಗಿ {{minutes}} ನಿಮಿಷಗಳ ಹಿಂದೆ ಪತ್ತೆಯಾಗಿದೆ.",
        "ml": "ഉപകരണം {{device_id}} ഓഫ്‌ലൈനാണ്. അവസാനമായി കണ്ടത് {{minutes}} മിനിറ്റുകൾക്ക് മുമ്പ്."
    },
    "disease_detected": {
        "en": "Farming Alert: {{disease}} detected with {{confidence}}% confidence.",
        "hi": "कृषि चेतावनी: {{confidence}}% आत्मविश्वास के साथ {{disease}} का पता चला है।",
        "te": "వ్యవసాయ అలర్ట్: {{confidence}}% ఖచ్చితత్వంతో {{disease}} గుర్తించబడింది.",
        "ta": "வேளாண் எச்சரிக்கை: {{confidence}}% நம்பிக்கையுடன் {{disease}} கண்டறியப்பட்டுள்ளது.",
        "kn": "ಕೃಷಿ ಎಚ್ಚರಿಕೆ: {{confidence}}% ನಿಖರತೆಯೊಂದಿಗೆ {{disease}} ಪತ್ತೆಯಾಗಿದೆ.",
        "ml": "കൃഷി മുന്നറിയിപ്പ്: {{confidence}}% കൃത്യതയോടെ {{disease}} കണ്ടെത്തിയിരിക്കുന്നു."
    },
    "recommendation_changed": {
        "en": "Water advisory: Recommendation updated to '{{recommendation}}'.",
        "hi": "जल सलाह: सिफारिश को '{{recommendation}}' पर अपडेट किया गया है।",
        "te": "నీటి సలహా: సూచన '{{recommendation}}' గా మార్చబడింది.",
        "ta": "நீர் ஆலோசனை: பரிந்துரை '{{recommendation}}' என மாற்றப்பட்டுள்ளது.",
        "kn": "ನೀರಾವರಿ ಸಲಹೆ: ಶಿಫಾರಸು '{{recommendation}}' ಕ್ಕೆ ನವೀಕರಿಸಲಾಗಿದೆ.",
        "ml": "നനവ് നിർദ്ദേശം: ശുപാർശ '{{recommendation}}' ആയി പുതുക്കിയിരിക്കുന്നു."
    },
    "possible_power_failure": {
        "en": "Possible Power Failure: Multiple offline metrics detected for device {{device_id}}.",
        "hi": "संभावित बिजली विफलता: डिवाइस {{device_id}} के लिए कई ऑफ़लाइन संकेतक मिले हैं।",
        "te": "విద్యుత్ వైఫల్యం ముప్పు: పరికరం {{device_id}} కోసం పలు ఆఫ్‌లైన్ సూచికలు నమోదయ్యాయి.",
        "ta": "மின் தடை சாத்தியம்: சாதனம் {{device_id}} இல் பல ஆஃப்லைன் அளவீடுகள் கண்டறியப்பட்டுள்ளன.",
        "kn": "ವಿದ್ಯುತ್ ಸ್ಥಗಿತದ ಸಾಧ್ಯತೆ: ಸಾಧನ {{device_id}} ಗಾಗಿ ಅನೇಕ ಆಫ್‌ಲೈನ್ ಸೂಚಕಗಳು ಪತ್ತೆಯಾಗಿವೆ.",
        "ml": "വൈദ്യുതി തടസ്സപ്പെടാൻ സാധ്യത: ഉപകരണം {{device_id}} ഓഫ്‌ലൈനായി കാണിക്കുന്നു."
    }
}

def render_template(template_key: str, lang: str, context: Dict[str, Any]) -> str:
    """
    Renders localized notification message by replacing placeholders with context variables.
    Falls back to English if the translation or template key is missing.
    """
    # 1. Fetch template dict for this warning key
    lang = lang or "en"
    lang = lang.lower()
    if lang not in ["en", "hi", "te", "ta", "kn", "ml"]:
        lang = "en"
        
    template_set = NOTIFICATION_TEMPLATES.get(template_key)
    if not template_set:
        # If the template key is not pre-registered, return custom raw message string if context has it
        raw_msg = context.get("message", f"Alert: {template_key}")
        return raw_msg

    # 2. Extract specific language template
    template_str = template_set.get(lang, template_set.get("en", ""))
    
    # 3. Replace placeholders like {{variable}} with context values
    def replace_placeholder(match):
        placeholder = match.group(1).strip()
        val = context.get(placeholder, f"{{{{{placeholder}}}}}")
        if isinstance(val, float):
            return f"{val:.1f}"
        return str(val)

    rendered = re.sub(r"\{\{([^}]+)\}\}", replace_placeholder, template_str)
    return rendered
