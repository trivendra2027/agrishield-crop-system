from datetime import timezone
import json
import logging
import asyncio
import os
import random
from typing import Optional
from openai import AsyncOpenAI, OpenAIError
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class NVIDIAService:
    def __init__(self):
        self.api_key = settings.NVIDIA_API_KEY
        self.base_url = settings.NVIDIA_API_BASE_URL
        self.model = settings.NVIDIA_MODEL_NAME
        
        self.client = None
        if self.api_key and "mock-api-key" not in self.api_key:
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=90.0  # Timeout handling (90 seconds for large translations)
            )
        else:
            logger.warning("NVIDIA_API_KEY is missing or contains placeholder. NVIDIA service running in dummy mode.")

    async def generate_farming_advice(
        self,
        crop_name: str,
        disease_name: str,
        confidence: float,
        farm_profile: Optional[dict] = None
    ) -> dict:
        """
        Sends details and optional farm context to NVIDIA API and returns structured agronomic advice.
        """
        # Clean disease name if it has internal labels
        clean_disease = disease_name.split("___")[-1].replace("_", " ").title()
        confidence_percent = f"{confidence * 100:.1f}" if confidence <= 1.0 else f"{confidence:.1f}"

        farm_context = ""
        if farm_profile:
            farm_context = f"""
Additional Farm Context:
- Farm Name: {farm_profile.get('farm_name', 'N/A')}
- Crop Variety: {farm_profile.get('crop_variety', 'N/A')}
- Growth Stage: {farm_profile.get('growth_stage', 'N/A')}
- Soil Type: {farm_profile.get('soil_type', 'N/A')}
- Irrigation Method: {farm_profile.get('irrigation_method', 'N/A')}
- Water Source: {farm_profile.get('water_source', 'N/A')}
- Location: {farm_profile.get('village', 'N/A')}, {farm_profile.get('district', 'N/A')}, {farm_profile.get('state', 'N/A')}
"""

        # Prompt specification
        prompt = f"""
You are an expert agronomist and farming assistant. Generate highly specific, detailed agronomic advice for a crop leaf diagnosis:
Crop: {crop_name}
Disease/Condition: {clean_disease}
AI Detection Confidence: {confidence_percent}%{farm_context}

Please tailor all advice (explanation, organic/chemical treatment, prevention methods, and best practices) specifically to the farmer's profile (crop variety, growth stage, soil type, irrigation method, etc.). For instance, if they use drip irrigation, recommend drip-specific sanitization.

You MUST respond with ONLY a valid JSON object matching the schema below.
DO NOT include any markdown formatting (like ```json), conversational greetings, or follow-up notes outside the JSON block.

JSON Schema:
{{
  "disease_explanation": "Detailed explanation of the disease biology and how it infects the leaf tissue.",
  "possible_causes": ["Cause 1", "Cause 2"],
  "severity": "Low, Medium, or High depending on typical damage thresholds",
  "organic_treatment": "Organic solutions, biological controls, or cultural sanitation.",
  "chemical_treatment": "Chemical fungicides or bactericides, along with active ingredients and spray details.",
  "prevention_methods": ["Prevention method 1", "Prevention method 2"],
  "best_farming_practices": ["Best farming practice 1", "Best farming practice 2"],
  "farmer_friendly_advice": "A short, positive, actionable message in simple English directly to the farmer."
}}
"""

        # Return dummy mock response if client is not configured
        if not self.client:
            logger.info("NVIDIA Service is unconfigured. Returning mock agronomy data.")
            return self._generate_mock_advice(crop_name, clean_disease, severity="Medium")

        try:
            logger.info(f"Sending prompt to NVIDIA API using model {self.model}...")
            
            for attempt in range(1, 2):
                try:
                    # Enforce a strict 5-second timeout at the asyncio level to prevent UI freezing
                    response = await asyncio.wait_for(
                        self.client.chat.completions.create(
                            model=self.model,
                            messages=[
                                {"role": "system", "content": "You are a professional agricultural advisor who replies strictly in JSON."},
                                {"role": "user", "content": prompt}
                            ],
                            temperature=0.2,
                            max_tokens=1024,
                            timeout=5.0
                        ),
                        timeout=6.0
                    )
                    
                    content = response.choices[0].message.content.strip()
                    logger.debug(f"Received raw NVIDIA response: {content}")
                    
                    # Robust JSON parsing
                    try:
                        # Strip markdown blocks if returned
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0].strip()
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0].strip()
                        
                        parsed_data = json.loads(content)
                        
                        # Check keys exist, substitute fallback values if missing
                        required_keys = [
                            "disease_explanation", "possible_causes", "severity", 
                            "organic_treatment", "chemical_treatment", "prevention_methods", 
                            "best_farming_practices", "farmer_friendly_advice"
                        ]
                        for key in required_keys:
                            if key not in parsed_data:
                                parsed_data[key] = f"Generic info for {key}"
                        
                        # Safe conversion for fields expected to be strings
                        string_fields = ["disease_explanation", "severity", "organic_treatment", "chemical_treatment", "farmer_friendly_advice"]
                        for field in string_fields:
                            val = parsed_data[field]
                            if isinstance(val, dict):
                                lines = []
                                for k, v in val.items():
                                    k_clean = k.replace("_", " ").title()
                                    if isinstance(v, list):
                                        v_str = ", ".join(map(str, v))
                                    else:
                                        v_str = str(v)
                                    lines.append(f"{k_clean}: {v_str}")
                                parsed_data[field] = "\n".join(lines)
                            elif isinstance(val, list):
                                parsed_data[field] = ", ".join(map(str, val))
                            else:
                                parsed_data[field] = str(val)
                                
                        return parsed_data
                    except (json.JSONDecodeError, ValueError) as pe:
                        logger.error(f"Failed to parse JSON response from NVIDIA: {pe}. Raw: {content}")
                        raise ValueError("NVIDIA model response did not conform to JSON rules.")
                        
                except OpenAIError as oe:
                    logger.warning(f"NVIDIA API Error on attempt {attempt}: {oe}")
                    if attempt < 3:
                        await asyncio.sleep(attempt)
                    else:
                        logger.error(f"All 3 NVIDIA API attempts failed for farming advice.")
                        return {
                            "disease_explanation": "AI Assistant is temporarily unavailable. Please try again later.",
                            "possible_causes": [],
                            "severity": "Unknown",
                            "organic_treatment": "Unavailable",
                            "chemical_treatment": "Unavailable",
                            "prevention_methods": [],
                            "best_farming_practices": [],
                            "farmer_friendly_advice": "Please check back shortly when AI services are restored."
                        }

        except Exception as e:
            logger.error(f"Unexpected error in NVIDIA service: {e}")
            raise RuntimeError(f"Agronomic assistant service failure: {str(e)}")

    async def test_connection(self) -> dict:
        """
        Tests the connection to the NVIDIA API catalog.
        """
        if not self.client:
            return {"status": "unconfigured", "message": "NVIDIA_API_KEY is not configured on server."}

        try:
            logger.info("Testing NVIDIA connection...")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=10,
                temperature=0.1
            )
            reply = response.choices[0].message.content.strip()
            return {
                "status": "connected",
                "model": self.model,
                "response": reply
            }
        except OpenAIError as oe:
            logger.error(f"NVIDIA test connection failed: {oe}")
            return {"status": "error", "message": f"NVIDIA API Error: {str(oe)}"}
        except Exception as e:
            logger.error(f"NVIDIA test connection unexpected error: {e}")
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}

    def _generate_mock_advice(self, crop: str, disease: str, severity: str) -> dict:
        """Generates dynamic dummy data for agronomic responses when API is disabled."""
        return {
            "disease_explanation": f"In-memory diagnostic explanation: {disease} leaf spot commonly damages chloroplastic layers in {crop} foliage.",
            "possible_causes": [
                "Elevated humidity (>85%) combined with pooling surface water.",
                "Fungal spores remaining on un-tilled plant residue from last season."
            ],
            "severity": severity,
            "organic_treatment": f"Apply organic copper soap mixtures directly onto bottom branches of the {crop}.",
            "chemical_treatment": "Spray systemic fungicides containing chlorothalonil early in the morning cycles.",
            "prevention_methods": [
                "Increase row spacing parameters to allow faster canopy evaporation.",
                "Always sanitize pruning shears between row sets."
            ],
            "best_farming_practices": [
                "Schedule drip lines to operate at soil layer only.",
                "Prune the lowest 3 leaf sets to stop fungal soil splash cycles."
            ],
            "farmer_friendly_advice": f"Keep inspecting your {crop} crops. Immediate pruning can quickly arrest this spread. Stay positive!"
        }

    async def translate_diagnosis(self, fields: dict, language: str) -> dict:
        """
        Translates the key diagnosis text fields into the target language using the NVIDIA LLM.
        Falls back silently if the API client is not configured.
        """
        lang_map = {
            "hi": "Hindi",
            "te": "Telugu",
            "ta": "Tamil",
            "kn": "Kannada",
            "ml": "Malayalam",
        }
        lang_name = lang_map.get(language.lower(), "English")
        if lang_name == "English" or not self.client:
            return fields  # No translation needed or client unavailable

        import json as _json

        prompt = f"""You are a professional agricultural translator.
Translate the following farming diagnosis JSON fields into {lang_name}.
For any chemical, fungicide, or pesticide names (e.g. 'Mancozeb', 'Azoxystrobin'), output them in BOTH English and {lang_name} (e.g., 'Mancozeb (మాంకోజెబ్)').
Keep all list items as a list. Keep all string values as strings.
CRITICAL: DO NOT translate the JSON keys. ONLY translate the string values.
CRITICAL: Output raw Unicode characters directly. DO NOT use \\uXXXX unicode escaping.
Respond with ONLY valid JSON. Do NOT add markdown or extra text.

Fields to translate:
{_json.dumps(fields, ensure_ascii=False, indent=2)}
"""
        try:
            for attempt in range(1, 3):
                try:
                    response = await self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": f"You are a professional agricultural translator. Always respond in pure JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.1,
                        max_tokens=4096,
                        timeout=90.0
                    )
                    content = response.choices[0].message.content.strip()
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0].strip()
                    translated = _json.loads(content)
                    return translated
                except Exception as ex:
                    logger.warning(f"Translation attempt {attempt} failed: {ex}")
                    if attempt < 2:
                        await asyncio.sleep(1)
        except Exception as e:
            logger.warning(f"translate_diagnosis failed: {e}")
        return fields  # Return original if translation fails

    async def chat_with_assistant(self, message: str, history: list, context: dict = None) -> str:
        """
        Generic chat endpoint using the NVIDIA LLM for agricultural support.
        Injects the real-time context (sensor data, recent prediction) as a system prompt.
        """
        if not self.client:
            return "NVIDIA Service is currently running in mock mode. Please configure a valid NVIDIA API Key to enable the conversational LLM Assistant."

        try:
            # IoT Simulation Intercept
            iot_mode = os.getenv("IOT_MODE", "simulation")
            if iot_mode == "simulation":
                if not context:
                    context = {}
                # Inject mock hardware simulation
                context["sensor_data"] = {
                    "temperature": round(random.uniform(20.0, 35.0), 1),
                    "humidity": round(random.uniform(40.0, 90.0), 1),
                    "soil_moisture": round(random.uniform(20.0, 80.0), 1),
                    "light_intensity": round(random.uniform(200.0, 1000.0), 1),
                    "rain_sensor": random.choice([0, 1]),
                    "battery_level": round(random.uniform(50.0, 100.0), 1),
                    "device_status": "online_simulated"
                }
                
            # Build context string
            context_str = ""
            lang_instruction = ""
            if context:
                context_str = "\n[Current Farm Context Data (Real-time)]\n"
                for k, v in context.items():
                    if k == "active_farm" and isinstance(v, dict):
                        context_str += "- Active Farm Profile:\n"
                        for fk, fv in v.items():
                            if fv is not None and fk not in ["id", "user_id", "created_at", "updated_at", "_id"]:
                                context_str += f"  * {fk.replace('_', ' ').title()}: {fv}\n"
                    elif k == "latest_scan_result" and isinstance(v, dict):
                        context_str += "- User's Most Recent Crop Diagnostic Scan:\n"
                        for sk, sv in v.items():
                            if sv:
                                context_str += f"  * {sk}: {sv}\n"
                    elif k == "full_scan_history" and isinstance(v, list):
                        context_str += f"\n- User's Complete Crop Disease Scan History (Last {len(v)} Scans):\n"
                        for idx, scan in enumerate(v, 1):
                            context_str += f"  [{idx}] {scan.get('date', '')} {scan.get('time', '')} -> Crop: {scan.get('crop')} | Condition: {scan.get('disease')} (Confidence: {scan.get('confidence')}, Severity: {scan.get('severity')})\n"
                            if scan.get('organic_treatment') and scan.get('organic_treatment') != "None":
                                context_str += f"      * Organic Tx: {scan.get('organic_treatment')[:120]}...\n"
                            if scan.get('chemical_treatment') and scan.get('chemical_treatment') != "None":
                                context_str += f"      * Chemical Tx: {scan.get('chemical_treatment')[:120]}...\n"
                    else:
                        context_str += f"- {k}: {v}\n"
                    if k.lower() == "language" and v:
                        lang_instruction += f"\nCRITICAL: The user prefers to communicate in '{v}'. You MUST translate your ENTIRE response into '{v}'. Do not mix English. Use simple, farmer-friendly vocabulary. You must preserve the scientific crop disease names (e.g., 'Tomato Early Blight') but explain them simply in '{v}'."
                    if k.lower() == "current_time_ampm" and v:
                        lang_instruction += f"\nCRITICAL MANDATORY INSTRUCTION: If asked for the current time, you MUST respond EXACTLY with the string '{v}'. Do NOT convert to 24-hour time. Do NOT calculate the time. Simply output '{v}'."

            user_role = (context.get("user_role") or context.get("role") or "farmer").lower() if context else "farmer"

            if user_role == "admin":
                system_prompt = f"""You are 'AgriShield Enterprise Admin AI', an Enterprise Systems Architect, Security Compliance Auditor, and IoT Network Operations Specialist.

You provide specialized diagnostic, administrative, and system assistance for Administrators:
1. 🛡️ **System & Role Administration:** Registered user accounts management in crop_disease_db.users, role privileges (Admin, Farmer, Tester, Researcher), password policies, and account lockouts.
2. 📟 **Hardware & IoT Fleet Operations:** ESP32 telemetry nodes status, GPIO pinouts (SPI/I2C/Analog/Digital), sensor calibrations, MicroSD mount status, battery voltage levels, and OTA firmware deployments.
3. 🔒 **Security & OWASP Compliance:** OWASP Top 10 vulnerability scores, rate limiting status, security headers, JWT rotation, and audit log analysis.
4. 💾 **Database & Backend Health:** MongoDB collection statistics, FastAPI micro-service routes, Uvicorn server telemetry, and error log diagnostics.

ALWAYS format your responses using clean GitHub Markdown (bold headings, bullet points, tables where helpful, code blocks).{lang_instruction}
{context_str}"""
            elif user_role == "tester":
                system_prompt = f"""You are 'AgriShield QA & Simulation AI', a Automated QA Testing, Model Validation, and Simulation Specialist.

You provide specialized testing, benchmarking, and QA diagnostics for Testers:
1. 🧪 **Automated Test Suites:** Verification of Phase 5 production polish test suites, E2E test runs, and regression testing.
2. 📊 **PyTorch ML Model Validation:** EfficientNetV2 confidence thresholds, GradCAM heatmap saliency checks, 1226 crop disease classes, and precision metrics.
3. ⚡ **Telemetry Sensor Injection:** ESP32 simulated sensor telemetry (Soil Moisture ADC, Rain AO, AHT20 Temp/Humidity, BMP280 Pressure, BH1750 Lux, Battery ADC).
4. 🐛 **API & Latency Debugging:** HTTP status code analysis, response times, error tracebacks, and edge-case validation.

ALWAYS format your responses using clean GitHub Markdown (bold headings, bullet points, tables, code snippets).{lang_instruction}
{context_str}"""
            else:
                system_prompt = f"""You are 'AgriShield AI Agronomist', a Master Soil Scientist, Crop Disease Pathologist, and Smart Farming Specialist.

You provide expert, actionable, and farmer-friendly advice on ALL agricultural topics:
1. 🌾 **Farm & Field Management:** Land preparation, crop rotation, intercropping, and yield optimization.
2. 🪵 **Soil Health & Nutrition:** NPK fertilizer dosages, soil pH balance, organic compost, and micronutrients.
3. 🌱 **Plant Care & Pathology:** Crop disease diagnosis, fungal/bacterial/viral treatment (organic & chemical), and pest control.
4. 💧 **Irrigation & Water Science:** Drip/sprinkler watering schedules, soil moisture targets, and rain advisories.
5. ⚡ **Smart IoT & Weather:** Real-time sensor telemetry interpretation and micro-climate advisories.

ALWAYS format your responses using clean GitHub Markdown (bold headings, bullet points, numbered steps). Keep explanations clear and farmer-friendly.{lang_instruction}
{context_str}"""

            messages = [{"role": "system", "content": system_prompt}]
            
            # Append history
            for msg in history[-10:]: # keep last 10 messages for context window
                if hasattr(msg, 'role') and msg.role in ["user", "assistant"]:
                    messages.append({"role": msg.role, "content": msg.content})
                elif isinstance(msg, dict) and msg.get('role') in ["user", "assistant"]:
                    messages.append({"role": msg.get('role'), "content": msg.get('content')})
                    
            # Append current message
            messages.append({"role": "user", "content": message})

            for attempt in range(1, 4):
                try:
                    response = await self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=0.3,
                        max_tokens=1024,
                        timeout=10.0
                    )
                    
                    reply = response.choices[0].message.content.strip()
                    return reply
                except OpenAIError as oe:
                    logger.warning(f"NVIDIA API Error on chat attempt {attempt}: {oe}")
                    if attempt < 3:
                        await asyncio.sleep(attempt)
                    else:
                        return "AI Assistant is temporarily unavailable. Please try again later."
        except Exception as e:
            logger.error(f"NVIDIA chat request failed: {e}")
            return "AI Assistant is temporarily unavailable. Please try again later."

    async def generate_smart_alert_recommendation(
        self,
        base_message: str,
        category: str,
        priority: str,
        lang: str = "en"
    ) -> Optional[str]:
        """
        Sends telemetry alert message to NVIDIA API and returns structured agronomic suggestions.
        """
        if not self.client:
            logger.info("NVIDIA Service is unconfigured. Skipping recommendation generation.")
            return None

        prompt = f"Provide a brief 1-2 sentence agricultural recommendation for a farmer whose telemetry shows: {base_message}."
        
        # Translate simple instructions for target language if needed
        lang_map = {
            "en": "English",
            "hi": "Hindi",
            "te": "Telugu",
            "ta": "Tamil",
            "kn": "Kannada",
            "ml": "Malayalam"
        }
        lang_name = lang_map.get(lang.lower(), "English")
        lang_instruction = ""
        if lang.lower() != "en":
            lang_instruction = f" You MUST respond strictly in the '{lang_name}' language."

        try:
            logger.info(f"Requesting smart advice alert recommendations from NVIDIA Llama model ({lang_name})...")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a professional agronomist. Answer briefly and directly in simple terms.{lang_instruction}"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Failed to fetch NVIDIA alert recommendation from model: {e}")
            return None

nvidia_service = NVIDIAService()
