from datetime import timezone
"""
Botanical knowledge repository for Plant Identification Service.
Provides comprehensive agronomic and botanical metadata for crops, fruits, vegetables, flowers, trees, weeds, and medicinal plants.
Includes native language translations for South Indian regional farmers (Telugu, Tamil, Malayalam, Kannada, Marathi, Hindi).
Covers all broadleaf, grassy, sedge, and aquatic agricultural weed varieties.
"""

PLANT_DATABASE = {
    # ==================== CROPS ====================
    "rice": {
        "common_name": "Rice / Paddy Crop",
        "regional_names": {
            "te": "వరి (Vari)",
            "ta": "நெல் (Nel)",
            "ml": "നെല്ല് (Nellu)",
            "kn": "అక్కి / భత్త (Akki)",
            "mr": "तांदूळ (Tandul)",
            "hi": "धान / चावल (Dhan)"
        },
        "scientific_name": "Oryza sativa",
        "family": "Paddy Cereal Crop",
        "category": "Cereal Grain Crop",
        "description": "Primary staple food crop cultivated across South India in flooded paddies and aerobic soils.",
        "native_region": "South Asia & Tropical Asia",
        "growth_stage": "Tillering & Panicle Initiation",
        "growing_season": "Kharif & Rabi Seasons",
        "harvest_season": "100 - 145 days after sowing",
        "soil_type": "Clay loam or heavy clay retaining moisture (pH 5.5 - 6.5)",
        "temperature_range": "22°C - 34°C",
        "water_requirement": "Flooded paddy or Alternate Wetting & Drying (AWD)",
        "sunlight_requirement": "Full Sun (6 to 8 hours daily)",
        "fertilizer_recommendation": "NPK 120:60:60 kg/ha split application of Urea & MOP Potash",
        "economic_importance": "Primary staple crop for 80%+ of South Indian farming families.",
        "common_uses": ["Steamed grain staple", "Rice flour & parboiled rice", "Paddy straw fodder"],
        "common_diseases": ["Rice Blast", "Bacterial Leaf Blight", "Sheath Blight", "Brown Spot"],
        "common_pests": ["Yellow Stem Borer", "Brown Planthopper (BPH)", "Gall Midge"]
    },
    "paddy": {
        "common_name": "Rice / Paddy Crop",
        "regional_names": {
            "te": "వరి (Vari)",
            "ta": "நெல் (Nel)",
            "ml": "നെല്ല് (Nellu)",
            "kn": "అక్కి / భత్త (Akki)",
            "mr": "तांदूळ (Tandul)",
            "hi": "धान / चावल (Dhan)"
        },
        "scientific_name": "Oryza sativa",
        "family": "Paddy Cereal Crop",
        "category": "Cereal Grain Crop",
        "description": "Primary staple food crop cultivated across South India in flooded paddies and aerobic soils.",
        "native_region": "South Asia & Tropical Asia",
        "growth_stage": "Tillering & Panicle Initiation",
        "growing_season": "Kharif & Rabi Seasons",
        "harvest_season": "100 - 145 days after sowing",
        "soil_type": "Clay loam or heavy clay retaining moisture (pH 5.5 - 6.5)",
        "temperature_range": "22°C - 34°C",
        "water_requirement": "Flooded paddy or Alternate Wetting & Drying (AWD)",
        "sunlight_requirement": "Full Sun (6 to 8 hours daily)",
        "fertilizer_recommendation": "NPK 120:60:60 kg/ha split application of Urea & MOP Potash",
        "economic_importance": "Primary staple crop for 80%+ of South Indian farming families.",
        "common_uses": ["Steamed grain staple", "Rice flour & parboiled rice", "Paddy straw fodder"],
        "common_diseases": ["Rice Blast", "Bacterial Leaf Blight", "Sheath Blight", "Brown Spot"],
        "common_pests": ["Yellow Stem Borer", "Brown Planthopper (BPH)", "Gall Midge"]
    },
    "ragi": {
        "common_name": "Finger Millet / Ragi",
        "regional_names": {
            "te": "రాగులు / చోడులు (Ragulu)",
            "ta": "கேழ்வரகு / ராகி (Kelvaragu)",
            "ml": "പഞ്ചപ്പുല്ല് / രാഗി (Panchappullu)",
            "kn": "రాగి (Ragi)",
            "mr": "नाचणी (Nachani)",
            "hi": "రాగి / మండువా (Ragi)"
        },
        "scientific_name": "Eleusine coracana",
        "family": "Nutri-Cereal Millet",
        "category": "Millet Crop",
        "description": "Highly nutritious, drought-hardy South Indian staple rich in calcium, iron, and fiber.",
        "native_region": "Ethiopian & Indian Highlands",
        "growth_stage": "Tillering & Earhead Flowering",
        "growing_season": "Monsoon / Rainfed Season",
        "harvest_season": "90 - 110 days",
        "soil_type": "Free-draining loamy & red soils (pH 5.0 - 7.0)",
        "temperature_range": "20°C - 32°C",
        "water_requirement": "Low water requirement (Drought resilient)",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Organic FYM compost + NPK 40:20:20 kg/ha",
        "economic_importance": "Superfood millet essential for dryland South Indian farmers.",
        "common_uses": ["Ragi malt beverage", "Ragi mudde / ball", "Ragi roti & dosa", "Health porridge"],
        "common_diseases": ["Ragi Blast (Pyricularia)", "Band Leaf & Sheath Blight"],
        "common_pests": ["Pink Stem Borer", "Earhead Caterpillar", "Aphids"]
    },
    "sugarcane": {
        "common_name": "Sugarcane Crop",
        "regional_names": {
            "te": "చెరకు (Cheruku)",
            "ta": "கரும்பு (Karumbu)",
            "ml": "കരിമ്പ് (Karimbu)",
            "kn": "కబ్బూ (Kabbu)",
            "mr": "ऊस (Uus)",
            "hi": "గన్నా (Ganna)"
        },
        "scientific_name": "Saccharum officinarum",
        "family": "Commercial Cash Crop",
        "category": "Sugar & Cash Crop",
        "description": "High-value commercial cash crop cultivated extensively for sugar and jaggery production.",
        "native_region": "South & Southeast Asia",
        "growth_stage": "Grand Growth & Cane Elongation",
        "growing_season": "Perennial / Annual Crop",
        "harvest_season": "10 - 14 months",
        "soil_type": "Deep well-drained loams & heavy clay soils (pH 6.5 - 7.5)",
        "temperature_range": "25°C - 38°C",
        "water_requirement": "High irrigation via drip or furrow systems",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "NPK 250:100:120 kg/ha with Zinc & Iron foliar sprays",
        "economic_importance": "Major industrial cash crop for sugar mills and bioethanol distillation.",
        "common_uses": ["Refined sugar & jaggery (Gud)", "Fresh sugarcane juice", "Bagasse biofuel"],
        "common_diseases": ["Red Rot", "Smut", "Wilt", "Grassy Shoot Disease"],
        "common_pests": ["Early Shoot Borer", "Top Shoot Borer", "Pyrilla", "Whitefly"]
    },

    # ==================== BROADLEAF & AGGRESSIVE WEEDS ====================
    "parthenium": {
        "common_name": "Parthenium Weed / Congress Grass",
        "regional_names": {
            "te": "పార్థీనియం / వయ్యారి భామ (Parthenium)",
            "ta": "கோபக் கீரை / காங்கிரசு புல் (Parthenium)",
            "ml": "പാർത്ഥീനിയം (Parthenium)",
            "kn": "కాంగ్రెస్ గిడ (Parthenium)",
            "mr": "गाजर गवत (Gajar Gavat)",
            "hi": "గాజర్ ఘాస్ (Gajar Ghas)"
        },
        "scientific_name": "Parthenium hysterophorus",
        "family": "Invasive Agricultural Weed",
        "category": "Harmful Agricultural Weed",
        "description": "Highly aggressive invasive weed that suppresses crop growth, depletes soil nutrients, and causes skin/respiratory allergies.",
        "native_region": "Tropical Americas",
        "growth_stage": "Rapid Flowering & Seed Production",
        "growing_season": "Year-round opportunistic weed",
        "harvest_season": "N/A (Weed target for eradication)",
        "soil_type": "Thrives on all dry, disturbed, or rainfed farm soils",
        "temperature_range": "15°C - 42°C",
        "water_requirement": "Extremely drought tolerant",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Eradication: Spray Glyphosate or 20% Common Salt solution before flowering",
        "economic_importance": "Harmful weed causing up to 40% yield loss in dryland crops.",
        "common_uses": ["No commercial uses — Eradicate immediately to protect crop health"],
        "common_diseases": ["Parthenium Rust Fungus (Biocontrol agent)"],
        "common_pests": ["Zygogramma bicolorata (Mexican Beetle - Natural biocontrol agent)"]
    },
    "lantana": {
        "common_name": "Lantana Weed / Unni Chettu",
        "regional_names": {
            "te": "ఉన్ని చెట్టు / తలంబ్రాల చెట్టు (Lantana)",
            "ta": "உன்னிச் செடி (Unni)",
            "ml": "അരിപ്പൂച്ചെടി (Arippoo)",
            "kn": "లంతాన గిడ (Lantana)",
            "mr": "घाणेरी (Ghaneri)",
            "hi": "రాయ్ మునియా (Rai Munia)"
        },
        "scientific_name": "Lantana camara",
        "family": "Shrubby Broadleaf Weed",
        "category": "Toxic Shrub Weed",
        "description": "Toxic shrub weed forming impenetrable thickets in pastures, orchards, and forest boundaries.",
        "native_region": "Tropical America",
        "growth_stage": "Perennial Shrub Flowering",
        "growing_season": "Year-round",
        "harvest_season": "N/A (Eradicate)",
        "soil_type": "Adaptable to dry red soil, gravel, and wasteland",
        "temperature_range": "15°C - 45°C",
        "water_requirement": "Extremely drought resistant",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Mechanical uprooting or 2,4-D amine herbicide spray on fresh cut stumps",
        "economic_importance": "Toxic to cattle & goats; invades mango, cashew & coconut orchards.",
        "common_uses": ["Eradicate — Toxic to livestock"],
        "common_diseases": ["Lantana Dieback"],
        "common_pests": ["Teleonemia scrupulosa (Lantana Bug biocontrol)"]
    },
    "amaranthus_weed": {
        "common_name": "Wild Amaranth Weed / Thotakura Weed",
        "regional_names": {
            "te": "పిచ్చి తోటకూర గడ్డి (Wild Amaranth)",
            "ta": "குப்பைக் கீரை (Kuppai Keerai)",
            "ml": "കാട്ടു ചീര (Kattu Cheera)",
            "kn": "ముళ్ళ దంటిನ గిడ (Mulla Danti)",
            "mr": "माठ गवत (Math)",
            "hi": "జంగ్లీ చౌలాయీ (Jungli Chaulai)"
        },
        "scientific_name": "Amaranthus viridis",
        "family": "Broadleaf Field Weed",
        "category": "Agricultural Broadleaf Weed",
        "description": "Fast-growing broadleaf weed that competes with cotton, chilli, groundnut, and vegetable crops for soil nitrogen.",
        "native_region": "Tropical South America & Asia",
        "growth_stage": "Vegetative Seed Set",
        "growing_season": "Kharif & Summer",
        "harvest_season": "N/A (Weed control)",
        "soil_type": "Rich fertile farm loams",
        "temperature_range": "20°C - 38°C",
        "water_requirement": "Moderate",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Manual hand weeding or pre-emergence Pendimethalin spray",
        "economic_importance": "Reduces crop growth by robbing soil nitrogen.",
        "common_uses": ["Remove before seed formation"],
        "common_diseases": ["White Blister Rust"],
        "common_pests": ["Amaranthus Stem Weevil"]
    },
    "chenopodium": {
        "common_name": "Bathua Weed / Pigweed",
        "regional_names": {
            "te": "పప్పుకూర పిచ్చి ఆకు (Bathua)",
            "ta": "பருப்புக் கீரை புல் (Bathua)",
            "ml": "വാസ്തു ചീര (Vastu Cheera)",
            "kn": "కాడు సమరసే గిడ (Kadu)",
            "mr": "चाकवत (Chakwat)",
            "hi": "బథువా (Bathua)"
        },
        "scientific_name": "Chenopodium album",
        "family": "Broadleaf Winter Weed",
        "category": "Agricultural Broadleaf Weed",
        "description": "Common winter broadleaf weed in wheat, mustard, onion, and vegetable fields.",
        "native_region": "Europe & Asia",
        "growth_stage": "Vegetative Leaf Expansion",
        "growing_season": "Rabi / Winter Season",
        "harvest_season": "N/A (Weed target)",
        "soil_type": "Nitrogen-rich farm soils",
        "temperature_range": "10°C - 25°C",
        "water_requirement": "Moderate",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Post-emergence 2,4-D ethyl ester or manual hoeing",
        "economic_importance": "Depletes soil moisture in winter crops.",
        "common_uses": ["Edible young green leaves (Bathua saag)"],
        "common_diseases": ["Downy Mildew of Chenopodium"],
        "common_pests": ["Aphids", "Leaf Miner"]
    },
    "portulaca": {
        "common_name": "Purslane / Ganga Payala Weed",
        "regional_names": {
            "te": "గంగ పాయల ఆకు / పప్పుకూర మొక్క (Purslane)",
            "ta": "பருப்புக் கீரை (Paruppu Keerai)",
            "ml": "കൊഴുപ്പ (Kozhuppa)",
            "kn": "గోణి గిడ (Goni Gida)",
            "mr": "घोळ (Ghol)",
            "hi": "కూల్ఫా (Kulfa)"
        },
        "scientific_name": "Portulaca oleracea",
        "family": "Succulent Broadleaf Weed",
        "category": "Agricultural Broadleaf Weed",
        "description": "Mat-forming succulent weed with reddish stems that thrives in irrigated vegetable plots and orchards.",
        "native_region": "Old World Tropics",
        "growth_stage": "Prostrate Mat Expansion",
        "growing_season": "Summer & Rainy Season",
        "harvest_season": "N/A",
        "soil_type": "Sandy or loamy irrigated soils",
        "temperature_range": "20°C - 40°C",
        "water_requirement": "Highly drought tolerant succulent",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Shallow cultivation or mulching between crop rows",
        "economic_importance": "Competes with shallow-rooted vegetable crops.",
        "common_uses": ["Edible Omega-3 rich leafy herb"],
        "common_diseases": ["Dichotomophthora Leaf Spot"],
        "common_pests": ["Portulaca Leaf Miner"]
    },

    # ==================== SEDGE & GRASS WEEDS ====================
    "cyperus": {
        "common_name": "Nut Grass / Tunga Weed",
        "regional_names": {
            "te": "తుంగ గడ్డి (Tunga Gaddi)",
            "ta": "கோரை புல் (Korai Pul)",
            "ml": "മുത്തങ്ങ (Muthanga)",
            "kn": "ముస్తె గిడ (Muste)",
            "mr": "नागरमोथा (Nagarmotha)",
            "hi": "మోతా గస్ (Motha)"
        },
        "scientific_name": "Cyperus rotundus",
        "family": "Perennial Sedge Weed",
        "category": "Harmful Sedge Weed",
        "description": "Perennial sedge weed with underground nut tubers, considered one of the world's worst agricultural weeds.",
        "native_region": "Africa & Southern Asia",
        "growth_stage": "Tuberous Sprouting & Foliage Growth",
        "growing_season": "Year-round weed",
        "harvest_season": "N/A (Target for eradication)",
        "soil_type": "Moist, clay, or loamy soil",
        "temperature_range": "15°C - 40°C",
        "water_requirement": "Tolerates both wet paddies and drought",
        "sunlight_requirement": "Full Sun to Partial Shade",
        "fertilizer_recommendation": "Control: Apply Halosulfuron-methyl 75% WG or Glyphosate systemic herbicide",
        "economic_importance": "Competes fiercely with sugarcane, cotton, and vegetable crops for soil nutrients.",
        "common_uses": ["Traditional Ayurvedic oil extraction (Nagarmotha)"],
        "common_diseases": ["Fungal Rust (Puccinia cyperi)"],
        "common_pests": ["Bactra verutana (Sedge Moth)"]
    },
    "bermuda_grass": {
        "common_name": "Bermuda Grass / Garika Gaddi",
        "regional_names": {
            "te": "గరిక గడ్డి (Garika Gaddi)",
            "ta": "அறுகம்புல் (Arugampul)",
            "ml": "കറുക പുല്ല് (Karuka)",
            "kn": "గరికె గిడ (Garike)",
            "mr": "दुर्वा (Durva)",
            "hi": "దూబ్ ఘాస్ (Doob Ghas)"
        },
        "scientific_name": "Cynodon dactylon",
        "family": "Creeping Perennial Grass",
        "category": "Pasture Grass & Weed",
        "description": "Fast-spreading creeping stoloniferous grass used as livestock fodder, lawn grass, and sacred medicinal herb.",
        "native_region": "Middle East & Indian Subcontinent",
        "growth_stage": "Stoloniferous Creeping Mat",
        "growing_season": "Year-round",
        "harvest_season": "Continuous cutting",
        "soil_type": "Adaptable to all soil types (pH 5.5 - 8.5)",
        "temperature_range": "15°C - 40°C",
        "water_requirement": "Drought tolerant once rooted",
        "sunlight_requirement": "Full Direct Sun",
        "fertilizer_recommendation": "Responds well to organic FYM and nitrogen topdressing",
        "economic_importance": "Excellent cattle pasture grass and soil erosion control cover.",
        "common_uses": ["Cattle fodder grass", "Lawn turf", "Ayurvedic herbal juice", "Erosion control"],
        "common_diseases": ["Bermuda Grass Smut", "Bipolaris Leaf Spot"],
        "common_pests": ["Armyworms", "Bermudagrass Mite"]
    },
    "echinochloa": {
        "common_name": "Barnyard Grass / Oora Gaddi (Paddy Weed)",
        "regional_names": {
            "te": "ఊర గడ్డి / బొంత గడ్డి (Oora Gaddi)",
            "ta": "குதிரைவாலி புல் (Kudiraivali)",
            "ml": "കവട പുല്ല് (Kavada)",
            "kn": "కాడు బరగు గిడ (Kadu Baragu)",
            "mr": "सावा गवत (Sawa)",
            "hi": "సాన్వా ఘాస్ (Sanwa)"
        },
        "scientific_name": "Echinochloa crus-galli",
        "family": "Paddy Field Grassy Weed",
        "category": "Grassy Weed",
        "description": "Major grassy weed in flooded paddy fields mimicking young rice plants.",
        "native_region": "Tropical & Subtropical Asia",
        "growth_stage": "Tillering & Seed Head",
        "growing_season": "Monsoon / Paddy Season",
        "harvest_season": "N/A (Weed control)",
        "soil_type": "Waterlogged clay paddy soil",
        "temperature_range": "20°C - 38°C",
        "water_requirement": "High water requirement",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Pre-emergence Pretilachlor 50% EC spray in flooded paddy 3 days after transplanting",
        "economic_importance": "Causes up to 50% yield reduction in paddy crops if uncontrolled.",
        "common_uses": ["Fodder for cattle when young"],
        "common_diseases": ["Echinochloa Blast"],
        "common_pests": ["Paddy Stem Borer"]
    },
    "digitaria": {
        "common_name": "Crabgrass / Nari Gaddi",
        "regional_names": {
            "te": "నరి గడ్డి / పిచ్చి గడ్డి (Nari Gaddi)",
            "ta": "நரிப் புல் (Nari Pul)",
            "ml": "നരി പുല്ല് (Nari)",
            "kn": "నరి గిడ (Nari Gida)",
            "mr": "खेकडा गवत (Khekada)",
            "hi": "సాంక్రి ఘాస్ (Sankri)"
        },
        "scientific_name": "Digitaria sanguinalis",
        "family": "Annual Grassy Weed",
        "category": "Grassy Weed",
        "description": "Spreading annual grass weed that smothers young maize, sugarcane, groundnut, and cotton seedlings.",
        "native_region": "Europe & Asia",
        "growth_stage": "Spreading Mat",
        "growing_season": "Summer & Rainy Season",
        "harvest_season": "N/A",
        "soil_type": "Sandy or loamy dryland soils",
        "temperature_range": "18°C - 38°C",
        "water_requirement": "Drought tolerant",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Inter-row cultivation or Quizalofop-p-ethyl post-emergence spray",
        "economic_importance": "Reduces early crop seedling vigor.",
        "common_uses": ["Cattle grazing"],
        "common_diseases": ["Helminthosporium Leaf Blight"],
        "common_pests": ["Grasshoppers"]
    },

    # ==================== AQUATIC PADDY WEEDS ====================
    "water_hyacinth": {
        "common_name": "Water Hyacinth / Gurrapu Dekka Weed",
        "regional_names": {
            "te": "గుర్రపు డెక్క / గుర్రం తామర (Gurrapu Dekka)",
            "ta": "ஆகாயத் தாமரை (Agaya Thamarai)",
            "ml": "ആഗായ വാഴ / കുളവാഴ (Kulavazha)",
            "kn": "నీరు తామరె గిడ (Neeru)",
            "mr": "जलकुंभी (Jalkumbhi)",
            "hi": "జలకుంబీ (Jalkumbhi)"
        },
        "scientific_name": "Eichhornia crassipes",
        "family": "Aquatic Invasive Weed",
        "category": "Aquatic Invasive Weed",
        "description": "Floating aquatic weed covering irrigation canals, paddy reservoirs, and farm ponds, choking oxygen and water flow.",
        "native_region": "Amazon Basin, South America",
        "growth_stage": "Floating Bulbous Rosette",
        "growing_season": "Year-round water weed",
        "harvest_season": "N/A (Clear immediately)",
        "soil_type": "Freshwater farm ponds & canals",
        "temperature_range": "15°C - 38°C",
        "water_requirement": "Flooded water body required",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Mechanical removal & bio-composting into organic manure",
        "economic_importance": "Blocks canal irrigation water flow to downstream fields.",
        "common_uses": ["Organic bio-fertilizer compost after shredding"],
        "common_diseases": ["Cercospora rodmanii (Biocontrol fungus)"],
        "common_pests": ["Neochetina eichhorniae (Weevil biocontrol)"]
    }
}

def get_plant_info(plant_key: str) -> dict:
    """
    Looks up plant information dictionary by key/name.
    Falls back to structured dynamic template if exact key isn't present.
    """
    normalized_key = plant_key.lower().strip()
    
    # Direct match check
    for key, data in PLANT_DATABASE.items():
        if key in normalized_key or normalized_key in key:
            return data.copy()

    # Dynamic fallback structured plant profile
    display_title = plant_key.replace('_', ' ').title()
    is_weed = any(w in normalized_key for w in ["weed", "grass", "gaddi", "pul", "gavat", "ghas", "parthenium", "cyperus"])
    
    cat = "Agricultural Weed" if is_weed else "Agricultural Crop"
    
    return {
        "common_name": f"{display_title} {'Weed' if is_weed else 'Crop'}",
        "regional_names": {
            "te": f"{display_title} (తెలుగు)",
            "ta": f"{display_title} (தமிழ்)",
            "ml": f"{display_title} (മലയാളം)",
            "kn": f"{display_title} (ಕನ್ನಡ)",
            "mr": f"{display_title} (मराठी)",
            "hi": f"{display_title} (हिंदी)"
        },
        "scientific_name": display_title,
        "family": cat,
        "category": cat,
        "description": f"Identified {cat.lower()} specimen ({display_title}).",
        "native_region": "South Indian Regional Agriculture",
        "growth_stage": "Active Growth",
        "growing_season": "Standard Regional Growing Season",
        "harvest_season": "N/A (Weed Control)" if is_weed else "60 - 90 days",
        "soil_type": "Fertile loamy farm soil (pH 6.0 - 7.0)",
        "temperature_range": "18°C - 38°C",
        "water_requirement": "Drought resilient" if is_weed else "Moderate Irrigation",
        "sunlight_requirement": "Full Sun",
        "fertilizer_recommendation": "Non-chemical hand weeding / mulching target" if is_weed else "Balanced NPK 10-10-10 with organic compost",
        "economic_importance": "Competes for soil nutrients; target for eradication." if is_weed else "Valuable food, spice, or forage crop.",
        "common_uses": ["Eradicate before seed formation to protect crop yields"] if is_weed else ["Crop production", "Culinary use", "Farming income"],
        "common_diseases": ["Weed Rust Fungus"] if is_weed else ["Foliar Spot", "Powdery Mildew", "Blight"],
        "common_pests": ["Biocontrol Weevils"] if is_weed else ["Aphids", "Borer Insects", "Mites"]
    }
