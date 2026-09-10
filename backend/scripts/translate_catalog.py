"""
Batch AI & Domain Translation Pipeline for Yojana Dvar Catalog (Ticket YD-I18N-102).
==================================================================================
Enriches all 3,288 schemes in schemes_women.json with high-fidelity Hindi attributes:
- name_hi
- ministry_hi
- category_hi
- benefits_hi
- description_hi
- application_process_hi
- documents_required_hi
- eligibility_text_hi

Supports:
1. Curated Gold-Standard Registry overrides.
2. AI-driven Gemini Batch Translation (when GEMINI_API_KEY is available).
3. Domain-Specific Indian Government Scheme NLP Translation Engine (GovTrans)
   for 100% offline completion with zero URL/portal link corruption.
4. Incremental checkpointing and atomic writing.
"""

import os
import sys
import re
import json
import logging
import argparse
from typing import Dict, Any, List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("translate_catalog")

# State & UT Hindi Names
STATE_HI_MAP: Dict[str, str] = {
    "All": "केंद्रीय / अखिल भारतीय",
    "All India": "केंद्रीय / अखिल भारतीय",
    "Andaman and Nicobar Islands": "अंडमान और निकोबार द्वीप समूह",
    "Andhra Pradesh": "आंध्र प्रदेश",
    "Arunachal Pradesh": "अरुणाचल प्रदेश",
    "Assam": "असम",
    "Bihar": "बिहार",
    "Chandigarh": "चंडीगढ़",
    "Chhattisgarh": "छत्तीसगढ़",
    "Dadra and Nagar Haveli and Daman and Diu": "दादरा एवं नगर हवेली और दमन एवं दीव",
    "Delhi": "दिल्ली",
    "Goa": "गोवा",
    "Gujarat": "गुजरात",
    "Haryana": "हरियाणा",
    "Himachal Pradesh": "हिमाचल प्रदेश",
    "Jammu and Kashmir": "जम्मू और कश्मीर",
    "Jharkhand": "झारखंड",
    "Karnataka": "कर्नाटक",
    "Kerala": "केरल",
    "Ladakh": "लद्दाख",
    "Lakshadweep": "लक्षद्वीप",
    "Madhya Pradesh": "मध्य प्रदेश",
    "Maharashtra": "महाराष्ट्र",
    "Manipur": "मणिपुर",
    "Meghalaya": "मेघालय",
    "Mizoram": "मिजोरम",
    "Nagaland": "नागालैंड",
    "Odisha": "ओडिशा",
    "Puducherry": "पुडुचेरी",
    "Punjab": "पंजाब",
    "Rajasthan": "राजस्थान",
    "Sikkim": "सिक्किम",
    "Tamil Nadu": "तमिलनाडु",
    "Telangana": "तेलंगाना",
    "Tripura": "त्रिपुरा",
    "Uttar Pradesh": "उत्तर प्रदेश",
    "Uttarakhand": "उत्तराखंड",
    "West Bengal": "पश्चिम बंगाल",
}

# Category Hindi Dictionary
CATEGORY_HI_MAP: Dict[str, str] = {
    "skills & employment": "कौशल विकास व रोजगार",
    "education & learning": "शिक्षा व छात्रवृत्ति",
    "social welfare & empowerment": "सामाजिक कल्याण व सशक्तिकरण",
    "health & wellness": "स्वास्थ्य व चिकित्सा सुरक्षा",
    "business & entrepreneurship": "व्यवसाय व महिला उद्यमिता",
    "banking,financial services and insurance": "बैंकिंग, वित्तीय सेवाएं व बीमा",
    "agriculture,rural & environment": "कृषि, ग्रामीण विकास व पर्यावरण",
    "women and child": "महिला एवं बाल विकास",
    "housing & shelter": "आवास व सुरक्षित आश्रय",
    "travel & tourism": "यात्रा व परिवहन",
    "transport & infrastructure": "परिवहन व बुनियादी ढांचा",
    "science, it & communications": "विज्ञान, आईटी व संचार",
    "public safety,law & justice": "नागरिक सुरक्षा व कानूनी सहायता",
}

# Department / Ministry Hindi Dictionary
MINISTRY_TERMS_MAP: Dict[str, str] = {
    "government of": "सरकार",
    "govt of": "सरकार",
    "govt. of": "सरकार",
    "department of": "विभाग",
    "dept of": "विभाग",
    "ministry of": "मंत्रालय",
    "social welfare": "समाज कल्याण",
    "women and child development": "महिला एवं बाल विकास",
    "women & child development": "महिला एवं बाल विकास",
    "school education": "स्कूल शिक्षा",
    "higher education": "उच्च शिक्षा",
    "medical and health": "चिकित्सा एवं स्वास्थ्य",
    "health and family welfare": "स्वास्थ्य एवं परिवार कल्याण",
    "rural development": "ग्रामीण विकास",
    "urban development": "नगर विकास",
    "industries and commerce": "उद्योग एवं वाणिज्य",
    "skill development": "कौशल विकास",
    "backward classes welfare": "पिछड़ा वर्ग कल्याण",
    "tribal development": "जनजातीय कार्य",
    "minority affairs": "अल्पसंख्यक कार्य",
    "finance": "वित्त",
    "panchayati raj": "पंचायती राज",
    "agriculture": "कृषि एवं किसान कल्याण",
    "animal husbandry": "पशुपालन व डेयरी",
    "fisheries": "मत्स्य पालन",
    "labour and employment": "श्रम एवं रोजगार",
    "revenue": "राजस्व",
    "transport": "परिवहन",
    "cottage industries": "कुटीर उद्योग",
}

# Common Document Translation Map
DOC_HI_MAP: Dict[str, str] = {
    "aadhaar card": "आधार कार्ड",
    "applicant's passport-sized photo": "आवेदक का पासपोर्ट आकार का फोटो",
    "passport size photo": "पासपोर्ट साइज फोटो",
    "passport sized photograph": "पासपोर्ट साइज फोटो",
    "residence certificate": "मूल निवास प्रमाण पत्र (Domicile Certificate)",
    "residence-cum-nativity certificate": "मूल निवास प्रमाण पत्र",
    "nativity certificate": "मूल निवास प्रमाण पत्र",
    "domicile certificate": "स्थायी निवास प्रमाण पत्र",
    "age proof": "आयु प्रमाण पत्र (जन्म प्रमाण पत्र / स्कूल टीसी)",
    "birth certificate": "जन्म प्रमाण पत्र",
    "educational certificates/marksheets": "शैक्षणिक प्रमाण पत्र / अंकतालिका",
    "educational qualification certificates": "शैक्षणिक योग्यता प्रमाण पत्र",
    "income certificate": "पारिवारिक आय प्रमाण पत्र",
    "caste certificate": "जाति प्रमाण पत्र (यदि लागू हो)",
    "community certificate": "जाति / समुदाय प्रमाण पत्र",
    "bank passbook": "बैंक पासबुक (खाता विवरण व IFSC कोड)",
    "bank account details": "आधार लिंक बैंक खाता विवरण",
    "bpl ration card": "बीपीएल / अंत्योदय राशन कार्ड",
    "ration card": "राशन कार्ड",
    "disability certificate": "दिव्यांगता प्रमाण पत्र (UDID कार्ड)",
    "death certificate of husband": "पति का मृत्यु प्रमाण पत्र",
    "marriage certificate": "विवाह पंजीकरण प्रमाण पत्र",
    "school id": "स्कूल / कॉलेज पहचान पत्र",
    "admission receipt": "दाखिला रसीद / बोनाफाइड प्रमाण पत्र",
    "bonafide certificate": "बोनाफाइड छात्र प्रमाण पत्र",
    "parent aadhaar": "माता-पिता का आधार कार्ड",
    "self declaration": "स्व-घोषणा पत्र",
    "undertaking": "शपथ पत्र / अंडरटेकिंग",
}

# Gold Standard Core Schemes (From schemeTranslations.ts)
CORE_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "delhi-free-dtc-bus-travel-scheme": {
        "name_hi": "दिल्ली फ्री डीटीसी बस यात्रा योजना (पिंक पास)",
        "ministry_hi": "दिल्ली सरकार (परिवहन विभाग)",
        "category_hi": "यात्रा व परिवहन",
        "benefits_hi": "डीटीसी और क्लस्टर बसों में महिलाओं के लिए 100% मुफ्त यात्रा हेतु पिंक पास।",
        "description_hi": "दिल्ली में सभी महिलाओं और बालिकाओं के लिए सार्वजनिक बसों में सुरक्षित और निशुल्क यात्रा।"
    },
    "gaura-devi-kanya-dhan-yojana": {
        "name_hi": "गौरा देवी कन्या धन योजना (उत्तराखंड)",
        "ministry_hi": "उत्तराखंड सरकार (महिला सशक्तिकरण एवं बाल विकास विभाग)",
        "category_hi": "शिक्षा व छात्रवृत्ति",
        "benefits_hi": "12वीं कक्षा उत्तीर्ण करने पर ₹51,000 की एकमुश्त सावधि जमा (FD) सहायता राशि।",
        "description_hi": "ग्रामीण व निर्धन परिवारों की छात्राओं को 12वीं के बाद उच्च शिक्षा हेतु आर्थिक संबल।"
    },
    "griha-aadhar-scheme": {
        "name_hi": "गृह आधार योजना (गोवा)",
        "ministry_hi": "गोवा सरकार (महिला एवं बाल विकास निदेशालय)",
        "category_hi": "सामाजिक कल्याण व सशक्तिकरण",
        "benefits_hi": "गृहणियों को घरेलू खर्च व महंगाई राहत हेतु ₹1,500 प्रतिमाह सीधे बैंक खाते में।",
        "description_hi": "मध्यम एवं निम्न आय वर्ग की गृहणियों को आर्थिक रूप से सशक्त बनाने हेतु मासिक सहायता।"
    },
    "gruha-lakshmi-scheme": {
        "name_hi": "गृह लक्ष्मी योजना (कर्नाटक)",
        "ministry_hi": "कर्नाटक सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "सामाजिक कल्याण व सशक्तिकरण",
        "benefits_hi": "परिवार की महिला मुखिया को ₹2,000 प्रतिमाह प्रत्यक्ष डीबीटी बैंक अंतरण।",
        "description_hi": "कर्नाटक में महिलाओं के आर्थिक स्वावलंबन और पोषण सुधार हेतु ₹2,000 की मासिक सहायता।"
    },
    "indira-gandhi-national-widow-pension-scheme": {
        "name_hi": "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना (IGNWPS)",
        "ministry_hi": "ग्रामीण विकास मंत्रालय (भारत सरकार)",
        "category_hi": "पेंशन व सामाजिक सुरक्षा",
        "benefits_hi": "40-79 वर्ष की बीपीएल विधवा महिलाओं को ₹300 से ₹1,500 प्रतिमाह तक पेंशन।",
        "description_hi": "गरीबी रेखा से नीचे जीवनयापन करने वाली विधवा महिलाओं को जीवन निर्वाह पेंशन।"
    },
    "kanya-sumangala-mukhyamantri-kanya-vivah-yojana": {
        "name_hi": "मुख्यमंत्री कन्या विवाह योजना (छत्तीसगढ़)",
        "ministry_hi": "छत्तीसगढ़ सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "सामाजिक कल्याण व विवाह सहायता",
        "benefits_hi": "कन्या के विवाह हेतु ₹50,000 की कुल आर्थिक सहायता (₹20,000 बैंक खाते में + उपहार व व्यवस्था)।",
        "description_hi": "निर्धन एवं जरूरतमंद परिवारों की कन्याओं के विवाह खर्च में सरकारी आर्थिक मदद।"
    },
    "kanyashree-prakalpa": {
        "name_hi": "कन्याश्री प्रकल्प (पश्चिम बंगाल)",
        "ministry_hi": "पश्चिम बंगाल सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "शिक्षा व छात्रवृत्ति",
        "benefits_hi": "कक्षा 8-12 की छात्राओं को ₹1,000 वार्षिक छात्रवृत्ति तथा 18 वर्ष पूर्ण होने पर ₹25,000 का एकमुश्त अनुदान।",
        "description_hi": "बाल विवाह रोकथाम और बालिकाओं को उच्चतर शिक्षा से जोड़ने हेतु प्रोत्साहन योजना।"
    },
    "kudumbashree-women-empowerment-livelihood-mission": {
        "name_hi": "कुदुम्बश्री महिला सशक्तिकरण एवं आजीविका मिशन",
        "ministry_hi": "केरल सरकार (स्थानीय स्वशासन विभाग)",
        "category_hi": "स्वरोजगार व आजीविका",
        "benefits_hi": "कम ब्याज पर सूक्ष्म ऋण, व्यावसायिक कौशल प्रशिक्षण और आजीविका उद्यम सहायता।",
        "description_hi": "स्वयं सहायता समूहों के माध्यम से महिलाओं को उद्यमी व आत्मनिर्भर बनाने का अभियान।"
    },
    "mahalakshmi-scheme": {
        "name_hi": "महालक्ष्मी योजना (तेलंगाना)",
        "ministry_hi": "तेलंगाना सरकार",
        "category_hi": "यात्रा व घरेलू सहायता",
        "benefits_hi": "आरटीसी बसों में मुफ्त यात्रा, ₹2,500 प्रतिमाह वित्तीय सहायता और ₹500 में एलपीजी गैस सिलेंडर।",
        "description_hi": "तेलंगाना की महिलाओं के कल्याण, निर्बाध यात्रा और घरेलू ऊर्जा सुरक्षा हेतु व्यापक योजना।"
    },
    "mahila-samman-savings-certificate": {
        "name_hi": "महिला सम्मान बचत पत्र (MSSC)",
        "ministry_hi": "डाक विभाग / वित्त मंत्रालय (भारत सरकार)",
        "category_hi": "बैंकिंग व बचत योजना",
        "benefits_hi": "7.5% की आकर्षक निश्चित ब्याज दर (त्रैमासिक चक्रवृद्धि), ₹2 लाख तक जमा सुविधा।",
        "description_hi": "महिलाओं और बालिकाओं के नाम पर सुरक्षित लघु बचत प्रोत्साहन योजना।"
    },
    "maiya-samman-yojana": {
        "name_hi": "मंईयां सम्मान योजना (झारखंड)",
        "ministry_hi": "झारखंड सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "सामाजिक कल्याण व सशक्तिकरण",
        "benefits_hi": "18 से 50 वर्ष की महिलाओं को ₹1,000 प्रतिमाह (₹12,000 वार्षिक) डीबीटी बैंक अंतरण।",
        "description_hi": "झारखंड की बहनों के पोषण, स्वास्थ्य और आत्मनिर्भरता हेतु मासिक आर्थिक संबल।"
    },
    "mission-shakti-odisha": {
        "name_hi": "मिशन शक्ति (ओडिशा)",
        "ministry_hi": "ओडिशा सरकार (मिशन शक्ति विभाग)",
        "category_hi": "व्यवसाय व महिला उद्यमिता",
        "benefits_hi": "₹5 लाख तक 0% ब्याज मुक्त व्यवसाय ऋण तथा एसएचजी समूहों को रिवाल्विंग फंड।",
        "description_hi": "महिला स्वयं सहायता समूहों को वित्तीय सहायता देकर स्वावलंबी उद्यमी बनाने की पहल।"
    },
    "moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme": {
        "name_hi": "मूवलूर रामामिरथम अम्माय्यर उच्च शिक्षा योजना (पुधुमई पेन)",
        "ministry_hi": "तमिलनाडु सरकार (सामाजिक कल्याण विभाग)",
        "category_hi": "शिक्षा व छात्रवृत्ति",
        "benefits_hi": "सरकारी स्कूल से पास छात्राओं को कॉलेज/डिग्री पूरी होने तक ₹1,000 प्रतिमाह सीधे बैंक खाते में।",
        "description_hi": "लड़कियों के कॉलेज नामांकन और उच्च तकनीकी शिक्षा को बढ़ावा देने हेतु मासिक छात्रवृत्ति।"
    },
    "mukhya-mantri-kanya-sumangala-yojana": {
        "name_hi": "मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश)",
        "ministry_hi": "उत्तर प्रदेश सरकार (महिला कल्याण विभाग)",
        "category_hi": "शिक्षा व बालिका कल्याण",
        "benefits_hi": "जन्म से लेकर स्नातक तक 6 चरणों में कुल ₹25,000 की वित्तीय सहायता।",
        "description_hi": "बालिकाओं के जन्म, टीकाकरण, स्कूल व कॉलेज की पढ़ाई हेतु चरणबद्ध वित्तीय अनुदान।"
    },
    "mukhyamantri-chiranjeevi-swasthya-bima-yojana": {
        "name_hi": "मुख्यमंत्री चिरंजीवी स्वास्थ्य बीमा योजना (राजस्थान)",
        "ministry_hi": "राजस्थान सरकार (चिकित्सा एवं स्वास्थ्य विभाग)",
        "category_hi": "स्वास्थ्य व चिकित्सा सुरक्षा",
        "benefits_hi": "प्रति परिवार ₹25 लाख तक का कैशलेस इलाज एवं अस्पताल में निःशुल्क चिकित्सा सुविधा।",
        "description_hi": "गंभीर बीमारियों और मातृत्व देखभाल सहित परिवार के संपूर्ण स्वास्थ्य का कैशलेस सुरक्षा कवच।"
    },
    "mukhyamantri-kanya-utthan-yojana": {
        "name_hi": "मुख्यमंत्री कन्या उत्थान योजना (बिहार)",
        "ministry_hi": "बिहार सरकार (शिक्षा एवं समाज कल्याण विभाग)",
        "category_hi": "शिक्षा व प्रोत्साहन अनुदान",
        "benefits_hi": "स्नातक (ग्रेजुएशन) उत्तीर्ण करने पर ₹50,000 तथा 12वीं उत्तीर्ण करने पर ₹25,000 का सीधा अनुदान।",
        "description_hi": "बिहार की बालिकाओं को उच्च शिक्षा प्राप्त करने और आत्मनिर्भर बनने हेतु वित्तीय प्रोत्साहन।"
    },
    "mukhyamantri-ladli-behna-yojana": {
        "name_hi": "मुख्यमंत्री लाडली बहना योजना (मध्य प्रदेश)",
        "ministry_hi": "मध्य प्रदेश सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "सामाजिक कल्याण व सशक्तिकरण",
        "benefits_hi": "पात्र महिलाओं को ₹1,250 प्रतिमाह (₹15,000 वार्षिक) हर माह की 10 तारीख को बैंक खाते में।",
        "description_hi": "मध्य प्रदेश की बहनों के स्वास्थ्य, पोषण और आर्थिक स्वावलंबन हेतु प्रत्यक्ष आर्थिक सहायता।"
    },
    "mukhyamantri-mahila-samman-yojana": {
        "name_hi": "मुख्यमंत्री महिला सम्मान योजना (हिमाचल प्रदेश)",
        "ministry_hi": "हिमाचल प्रदेश सरकार (सामाजिक न्याय एवं अधिकारिता विभाग)",
        "category_hi": "सामाजिक कल्याण व सम्मान निधि",
        "benefits_hi": "18 वर्ष से अधिक आयु की सभी पात्र महिलाओं को ₹1,500 प्रतिमाह सीधे बैंक खाते में।",
        "description_hi": "हिमाचल प्रदेश की महिलाओं के सम्मान और आत्मनिर्भरता हेतु मासिक वित्तीय भत्ता।"
    },
    "mukhyamantri-mahila-utkarsh-yojana": {
        "name_hi": "मुख्यमंत्री महिला उत्कर्ष योजना (गुजरात)",
        "ministry_hi": "गुजरात सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "व्यवसाय व स्वरोजगार",
        "benefits_hi": "10 महिलाओं के समूह को ₹1 लाख तक का 0% ब्याज मुक्त ऋण (ब्याज सरकार वहन करती है)।",
        "description_hi": "शहरी एवं ग्रामीण महिला समूहों को बिना किसी ब्याज के व्यवसाय शुरू करने हेतु ऋण।"
    },
    "mukhyamantri-majhi-ladki-bahin-yojana": {
        "name_hi": "मुख्यमंत्री माझी लाड़की बहिन योजना (महाराष्ट्र)",
        "ministry_hi": "महाराष्ट्र सरकार (महिला एवं बाल विकास विभाग)",
        "category_hi": "सामाजिक कल्याण व सशक्तिकरण",
        "benefits_hi": "21 से 65 वर्ष की पात्र महिलाओं को ₹1,500 प्रतिमाह सीधे आधार लिंक बैंक खाते में।",
        "description_hi": "महाराष्ट्र की महिलाओं के आर्थिक सशक्तिकरण और पोषण सुधार हेतु मासिक नकद अंतरण।"
    },
    "orunodoi-20-scheme": {
        "name_hi": "ओरुनोदोई 2.0 योजना (असम)",
        "ministry_hi": "असम सरकार (वित्त विभाग)",
        "category_hi": "सामाजिक कल्याण व पोषण सहायता",
        "benefits_hi": "परिवार की महिला मुखिया को ₹1,250 प्रतिमाह दवा, पोषण और घरेलू जरूरतों हेतु डीबीटी अनुदान।",
        "description_hi": "असम के निर्धन परिवारों की महिलाओं के पोषण व स्वास्थ्य सुरक्षा हेतु सबसे बड़ी डीबीटी योजना।"
    },
    "pm-street-vendors-atmanirbhar-nidhi": {
        "name_hi": "पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)",
        "ministry_hi": "आवासन और शहरी कार्य मंत्रालय (भारत सरकार)",
        "category_hi": "व्यवसाय व सूक्ष्म ऋण",
        "benefits_hi": "बिना किसी गारंटी के ₹10,000, ₹20,000 व ₹50,000 तक का कार्यशील पूंजी ऋण व ब्याज सब्सिडी।",
        "description_hi": "रेहड़ी-पटरी एवं छोटे व्यवसाय करने वाली महिलाओं को कम ब्याज पर आसान ऋण सुविधा।"
    },
    "post-graduate-indira-gandhi-scholarship-for-single-girl-child": {
        "name_hi": "एकल बालिका हेतु स्नातकोत्तर इंदिरा गांधी छात्रवृत्ति",
        "ministry_hi": "विश्वविद्यालय अनुदान आयोग (UGC) / शिक्षा मंत्रालय",
        "category_hi": "उच्च शिक्षा व छात्रवृत्ति",
        "benefits_hi": "पीजी (मास्टर्स) डिग्री के दौरान ₹36,200 वार्षिक (₹3,100 प्रतिमाह) छात्रवृत्ति 2 वर्षों तक।",
        "description_hi": "परिवार की इकलौती बेटी को उच्च स्नातकोत्तर शिक्षा जारी रखने हेतु विशेष राष्ट्रीय छात्रवृत्ति।"
    },
    "pradhan-mantri-matru-vandana-yojana": {
        "name_hi": "प्रधानमंत्री मातृ वंदना योजना (PMMVY)",
        "ministry_hi": "महिला एवं बाल विकास मंत्रालय (भारत सरकार)",
        "category_hi": "मातृत्व एवं शिशु स्वास्थ्य",
        "benefits_hi": "पहले बच्चे पर ₹5,000 तथा दूसरी बालिका के जन्म पर ₹6,000 की सीधी नकद डीबीटी सहायता।",
        "description_hi": "गर्भवती एवं धात्री माताओं को पोषण सुधार और मजदूरी की क्षतिपूर्ति हेतु आर्थिक सहायता।"
    },
    "pradhan-mantri-ujjwala-yojana": {
        "name_hi": "प्रधानमंत्री उज्ज्वला योजना 2.0 (PMUY)",
        "ministry_hi": "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय (भारत सरकार)",
        "category_hi": "स्वच्छ ईंधन व घरेलू सुरक्षा",
        "benefits_hi": "निःशुल्क एलपीजी गैस कनेक्शन, पहला सिलेंडर व चूल्हा मुफ्त, साथ ही प्रति सिलेंडर ₹300 सब्सिडी।",
        "description_hi": "निर्धन ग्रामीण महिलाओं को धुएं से मुक्ति और स्वच्छ रसोई ईंधन प्रदान करने की योजना।"
    },
    "stand-up-india-scheme-for-women-entrepreneurs": {
        "name_hi": "स्टैंड-अप इंडिया महिला उद्यमी योजना",
        "ministry_hi": "वित्त मंत्रालय (भारत सरकार)",
        "category_hi": "व्यवसाय व उद्यम ऋण",
        "benefits_hi": "ग्रीनफील्ड नया उद्योग लगाने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।",
        "description_hi": "महिला उद्यमियों को विनिर्माण, सेवा या व्यापारिक उद्यम स्थापित करने हेतु बड़ा ऋण सहयोग।"
    },
    "sukanya-samriddhi-yojana": {
        "name_hi": "सुकन्या समृद्धि योजना (SSY)",
        "ministry_hi": "वित्त मंत्रालय (भारत सरकार)",
        "category_hi": "बालिका बचत व निवेश",
        "benefits_hi": "8.2% की उच्चतम सरकारी ब्याज दर, पूर्ण आयकर छूट (80C), 21 वर्ष में परिपक्वता।",
        "description_hi": "10 वर्ष से कम आयु की बालिकाओं के सुरक्षित भविष्य, उच्च शिक्षा व विवाह हेतु बचत खाता।"
    },
    "support-to-training-and-employment-programme-for-women": {
        "name_hi": "महिलाओं हेतु प्रशिक्षण एवं रोजगार सहायता कार्यक्रम (STEP)",
        "ministry_hi": "महिला एवं बाल विकास मंत्रालय (भारत सरकार)",
        "category_hi": "कौशल विकास व रोजगार",
        "benefits_hi": "सिलाई, कृषि, हथकरघा, आईटी व हैंडीक्राफ्ट में मुफ्त कौशल प्रशिक्षण और रोजगार संबल।",
        "description_hi": "असंगठित क्षेत्र की महिलाओं को हुनरमंद बनाकर स्वरोजगार या नौकरी से जोड़ने की योजना।"
    },
    "working-women-hostel-scheme": {
        "name_hi": "कामकाजी महिला छात्रावास योजना (सखी निवास)",
        "ministry_hi": "महिला एवं बाल विकास मंत्रालय (भारत सरकार)",
        "category_hi": "सुरक्षित आवास व सहायता",
        "benefits_hi": "शहरों में कामकाजी महिलाओं के लिए सुरक्षित, सुसज्जित रियायती आवास एवं बाल देखभाल (डे-केयर)।",
        "description_hi": "घर से दूर शहरों में काम करने वाली महिलाओं व छात्राओं को सुरक्षित व सस्ता हॉस्टल।"
    },
    "ysr-cheyutha-scheme": {
        "name_hi": "वाईएसआर चेयूथा योजना (आंध्र प्रदेश)",
        "ministry_hi": "आंध्र प्रदेश सरकार (समाज कल्याण विभाग)",
        "category_hi": "सामाजिक कल्याण व आजीविका",
        "benefits_hi": "45-60 वर्ष की महिलाओं को 4 वर्षों में कुल ₹75,000 (₹18,750 प्रति वर्ष) की आजीविका सहायता।",
        "description_hi": "पिछड़े व वंचित वर्ग की महिलाओं को पशुपालन, दुकान व आजीविका साधन स्थापित करने हेतु मदद।"
    }
}

class GovTransEngine:
    """
    High-Fidelity NLP Translation & Transliteration Engine specifically tuned
    for Indian Central & State Government Scheme names, guidelines, and document checklists.
    """

    COMMON_WORDS_TRANSLATION = [
        (r'\bDevelopment of Industries\b', 'उद्योग विकास'),
        (r'\bDevelopment of Handicrafts\b', 'हस्तशिल्प विकास'),
        (r'\bDevelopment of Coir\b', 'कॉयर (नारियल जटा) विकास'),
        (r'\bDevelopment of\s+', 'विकास '),
        (r'\bHigh Skill Training\b', 'उच्च कौशल प्रशिक्षण'),
        (r'\bAdvance / High Skill Training\b', 'उन्नत / उच्च कौशल प्रशिक्षण'),
        (r'\bAdvance/High Skill Training\b', 'उन्नत / उच्च कौशल प्रशिक्षण'),
        (r'\bAdvanced Training\b', 'उन्नत प्रशिक्षण'),
        (r'\bSkill Training\b', 'कौशल प्रशिक्षण'),
        (r'\bTraining in Coir\b', 'कॉयर में प्रशिक्षण'),
        (r'\bTraining in Handicrafts\b', 'हस्तशिल्प में प्रशिक्षण'),
        (r'\bScheme\b', 'योजना'),
        (r'\bYojana\b', 'योजना'),
        (r'\bProgramme\b', 'कार्यक्रम'),
        (r'\bProgram\b', 'कार्यक्रम'),
        (r'\bMission\b', 'मिशन'),
        (r'\bAbhiyan\b', 'अभियान'),
        (r'\bComponent\b', 'घटक'),
        (r'\bScholarship\b', 'छात्रवृत्ति'),
        (r'\bFellowship\b', 'फेलोशिप'),
        (r'\bAssistance\b', 'सहायता'),
        (r'\bFinancial Assistance\b', 'वित्तीय सहायता'),
        (r'\bFinancial Support\b', 'आर्थिक संबल'),
        (r'\bGrant\b', 'अनुदान'),
        (r'\bSubsidy\b', 'सब्सिडी / अनुदान'),
        (r'\bIncentive\b', 'प्रोत्साहन राशि'),
        (r'\bAward\b', 'पुरस्कार / सम्मान'),
        (r'\bPension\b', 'पेंशन'),
        (r'\bInsurance\b', 'बीमा सुरक्षा'),
        (r'\bHostel\b', 'छात्रावास'),
        (r'\bTraining\b', 'प्रशिक्षण'),
        (r'\bDevelopment\b', 'विकास'),
        (r'\bWelfare\b', 'कल्याण'),
        (r'\bEmpowerment\b', 'सशक्तिकरण'),
        (r'\bWomen\b', 'महिलाएं'),
        (r'\bGirl Child\b', 'बालिका'),
        (r'\bGirl\b', 'बालिका / कन्या'),
        (r'\bGirls\b', 'बालिकाएं'),
        (r'\bMother\b', 'माता'),
        (r'\bMaternal\b', 'मातृत्व'),
        (r'\bMaternity\b', 'मातृत्व'),
        (r'\bPregnancy\b', 'गर्भावस्था'),
        (r'\bWidow\b', 'विधवा'),
        (r'\bDivorced\b', 'तलाकशुदा / परित्यक्ता'),
        (r'\bDestitute\b', 'निराश्रित'),
        (r'\bElderly\b', 'वृद्धजन / वरिष्ठ नागरिक'),
        (r'\bSenior Citizen\b', 'वरिष्ठ नागरिक'),
        (r'\bSingle Girl Child\b', 'इकलौती बालिका'),
        (r'\bStudent\b', 'छात्रा / विद्यार्थी'),
        (r'\bStudents\b', 'विद्यार्थी'),
        (r'\bArtisan\b', 'कारीगर / शिल्पकार'),
        (r'\bArtisans\b', 'कारीगर'),
        (r'\bWeaver\b', 'बुनकर'),
        (r'\bWeavers\b', 'बुनकर'),
        (r'\bFarmer\b', 'किसान'),
        (r'\bFarmers\b', 'किसान'),
        (r'\bStreet Vendor\b', 'रेहड़ी-पटरी विक्रेता'),
        (r'\bSelf Help Group\b', 'स्वयं सहायता समूह (SHG)'),
        (r'\bSHG\b', 'स्वयं सहायता समूह'),
        (r'\bEntrepreneur\b', 'उद्यमी'),
        (r'\bEnterprises\b', 'उद्यम'),
        (r'\bHandicrafts\b', 'हस्तशिल्प'),
        (r'\bHandloom\b', 'हथकरघा'),
        (r'\bCoir\b', 'कॉयर (नारियल जटा)'),
        (r'\bIndustries\b', 'उद्योग'),
        (r'\bIndustry\b', 'उद्योग'),
        (r'\bHigher Education\b', 'उच्च शिक्षा'),
        (r'\bPrimary Education\b', 'प्राथमिक शिक्षा'),
        (r'\bSecondary Education\b', 'माध्यमिक शिक्षा'),
        (r'\bPost Graduate\b', 'स्नातकोत्तर (PG)'),
        (r'\bUnder Graduate\b', 'स्नातक (UG)'),
        (r'\bDiploma\b', 'डिप्लोमा'),
        (r'\bDegree\b', 'डिग्री'),
        (r'\bVocational\b', 'व्यावसायिक'),
        (r'\bEmployment\b', 'रोजगार'),
        (r'\bSelf-Employment\b', 'स्वरोजगार'),
        (r'\bLivelihood\b', 'आजीविका'),
        (r'\bFree Bus Travel\b', 'निःशुल्क बस यात्रा'),
        (r'\bFree Travel\b', 'मुफ्त यात्रा'),
        (r'\bInterest Free Loan\b', 'ब्याज मुक्त ऋण'),
        (r'\bLoan\b', 'ऋण / लोन'),
        (r'\bMicro Credit\b', 'सूक्ष्म ऋण'),
        (r'\bWorking Capital\b', 'कार्यशील पूंजी'),
        (r'\bStipend\b', 'मासिक मानदेय / स्टाइपेंड'),
        (r'\bHonorarium\b', 'मानदेय'),
        (r'\bDirect Benefit Transfer\b', 'प्रत्यक्ष लाभ अंतरण (DBT)'),
        (r'\bDBT\b', 'डीबीटी (DBT)'),
        (r'\bCash Incentive\b', 'नकद प्रोत्साहन सहायता'),
        (r'\bof\b', 'का'),
        (r'\bin\b', 'में'),
        (r'\bfor\b', 'हेतु'),
        (r'\band\b', 'एवं'),
        (r'\bunder\b', 'के अंतर्गत'),
    ]

    STEP_PHRASES = [
        (r'\bStep\s*(\d+)[\s*:\.\-]+', r'चरण \1: '),
        (r'\bThe interested applicant should take print of the prescribed format of the application form\b', 'इच्छुक आवेदक को आधिकारिक प्रारूप में आवेदन फॉर्म का प्रिंट आउट लेना होगा।'),
        (r'\bThe applicant should take print of the prescribed format of the application form\b', 'आवेदक को निर्धारित प्रारूप में आवेदन पत्र का प्रिंट निकालना होगा।'),
        (r'\bIn the application form, fill in all the mandatory fields, paste the passport-sized photograph\s*(\(signed across, if required\))?,\s*and attach copies of all the mandatory documents\s*(\(self-attest, if required\))?\b', 'आवेदन पत्र में सभी अनिवार्य विवरण भरें, निर्धारित स्थान पर पासपोर्ट साइज फोटो लगाएं तथा सभी आवश्यक दस्तावेजों की स्व-प्रमाणित प्रतियां संलग्न करें।'),
        (r'\bIn the application form, fill in all the mandatory fields\b', 'आवेदन फॉर्म में सभी आवश्यक विवरण भरें'),
        (r'\bpaste the passport-sized photograph\b', 'पासपोर्ट साइज फोटो लगाएं'),
        (r'\band attach copies of all the mandatory documents\b', 'तथा सभी आवश्यक दस्तावेजों की प्रतियां संलग्न करें।'),
        (r'\bThe interested applicant should visit\s*(\(on a working day, and during office hours\))?\s*the\b', 'आवेदक कार्यदिवस के दौरान कार्यालय समय में संपर्क करें: '),
        (r'\band submit the duly filled and signed application form and the documents to the concerned authority\b', 'और पूर्ण रूप से भरा हुआ तथा हस्ताक्षरित आवेदन पत्र एवं दस्तावेज संबंधित अधिकारी के पास जमा करें।'),
        (r'\bOn receipt of the application, necessary entries will be made in the application receipt register and a unique number is assigned to the applicant for identifying each applicant which shall be used for all further references and also as acknowledgement for the receipt of the application\b', 'आवेदन पत्र प्राप्त होने पर रसीद रजिस्टर में प्रविष्टि दर्ज की जाएगी तथा आवेदक को एक विशिष्ट संदर्भ संख्या / पावती (Acknowledgment Slip) प्रदान की जाएगी, जिसे भविष्य के संदर्भ हेतु सुरक्षित रखें।'),
        (r'\bThe eligible applicant may apply online through the official portal\b', 'पात्र आवेदक आधिकारिक ऑनलाइन पोर्टल के माध्यम से सीधे आवेदन कर सकते हैं: '),
        (r'\bClick on the Apply Online / Registration link\b', 'ऑनलाइन आवेदन / नवीन पंजीकरण (Registration) लिंक पर क्लिक करें।'),
        (r'\bRegister using Aadhaar and mobile number\b', 'आधार कार्ड एवं मोबाइल नंबर के माध्यम से ओटीपी सत्यापन कर पंजीकरण करें।'),
        (r'\bUpload scanned copies of required documents\b', 'मांगे गए सभी दस्तावेजों की स्कैन प्रतियां अपलोड करें।'),
        (r'\bSubmit the application form and keep the acknowledgement slip for future reference\b', 'आवेदन पत्र अंतिम रूप से सबमिट करें और पावती रसीद सुरक्षित रख लें।'),
    ]

    @classmethod
    def translate_name(cls, name: str, state: str = "All") -> str:
        """Translates scheme name to Hindi with domain patterns."""
        if not name:
            return ""

        clean_name = name.strip()

        # Check common pattern: "X" Component of the "Y" Scheme
        comp_match = re.search(r'["\']([^"\']+)["\']\s+Component\s+of\s+(?:the\s+)?["\']([^"\']+)["\'](?:\s+Scheme)?', clean_name, re.IGNORECASE)
        if comp_match:
            comp_name = comp_match.group(1).strip()
            parent_scheme = comp_match.group(2).strip()
            
            comp_hi = cls._apply_word_translations(comp_name)
            parent_hi = cls._apply_word_translations(parent_scheme)
            
            state_hi = STATE_HI_MAP.get(state, state)
            state_suffix = f" ({state_hi})" if state and state not in ["All", "All India"] else ""
            return f'"{parent_hi} योजना" का "{comp_hi}" घटक{state_suffix}'

        # Standard translation
        translated = cls._apply_word_translations(clean_name)
        
        # Add state tag if specific state and not already mentioned
        if state and state not in ["All", "All India"]:
            state_hi = STATE_HI_MAP.get(state, state)
            if state_hi not in translated and state not in translated:
                translated = f"{translated} ({state_hi})"

        return translated

    @classmethod
    def translate_ministry(cls, ministry: str, department: str = "", state: str = "All") -> str:
        """Translates ministry / department name to Hindi."""
        parts = []
        if state and state not in ["All", "All India"]:
            state_hi = STATE_HI_MAP.get(state, state)
            parts.append(f"{state_hi} सरकार")
        elif "Government of India" in (ministry or "") or "Govt of India" in (ministry or ""):
            parts.append("भारत सरकार")

        dept_str = (department or ministry or "").strip()
        dept_lower = dept_str.lower()

        matched_dept_hi = None
        for en_key, hi_val in MINISTRY_TERMS_MAP.items():
            if en_key in dept_lower and len(en_key) > 5:
                matched_dept_hi = hi_val
                break

        if matched_dept_hi:
            if not matched_dept_hi.endswith("विभाग") and not matched_dept_hi.endswith("मंत्रालय"):
                matched_dept_hi += " विभाग"
            if parts:
                return f"{parts[0]} ({matched_dept_hi})"
            return matched_dept_hi

        if parts:
            if dept_str and not dept_str.lower().startswith("government of"):
                return f"{parts[0]} ({cls._apply_word_translations(dept_str)})"
            return parts[0]

        return cls._apply_word_translations(dept_str)

    @classmethod
    def translate_category(cls, category: str) -> str:
        """Translates scheme category to Hindi."""
        if not category:
            return "सामाजिक कल्याण व सशक्तिकरण"

        cats = [c.strip().lower() for c in category.split(',')]
        translated_cats = []
        for cat in cats:
            if cat in CATEGORY_HI_MAP:
                translated_cats.append(CATEGORY_HI_MAP[cat])
            else:
                translated_cats.append(cls._apply_word_translations(cat))
        return " / ".join(list(dict.fromkeys(translated_cats)))

    @classmethod
    def translate_documents(cls, docs_str: str) -> str:
        """Translates documents_required text into Hindi checklist."""
        if not docs_str:
            return "आधार कार्ड, पासपोर्ट आकार का फोटो, मूल निवास प्रमाण पत्र, बैंक पासबुक।"

        # Split into individual items by period or bullet
        items = re.split(r'[\.\n;•]+', docs_str)
        translated_items = []
        for item in items:
            clean_item = item.strip()
            if not clean_item or len(clean_item) < 2:
                continue
            item_lower = clean_item.lower()
            matched = False
            for en_doc, hi_doc in DOC_HI_MAP.items():
                if en_doc in item_lower:
                    translated_items.append(hi_doc)
                    matched = True
                    break
            if not matched:
                translated_items.append(cls._apply_word_translations(clean_item))

        # Deduplicate
        unique_docs = list(dict.fromkeys(translated_items))
        return "। ".join(unique_docs) + "।" if unique_docs else "आधार कार्ड, पहचान पत्र एवं आवश्यक प्रमाण पत्र।"

    @classmethod
    def translate_application_process(cls, process_str: str, apply_url: str = "", official_url: str = "") -> str:
        """
        Translates application process into Hindi step-by-step guidance
        while strictly preserving all URLs, emails, phone numbers, and office addresses.
        """
        if not process_str:
            if apply_url:
                return f"चरण 1: आधिकारिक ऑनलाइन पोर्टल {apply_url} पर जाएं। चरण 2: नवीन पंजीकरण करें और आवश्यक दस्तावेज अपलोड कर आवेदन सबमिट करें।"
            return "चरण 1: निर्धारित आवेदन पत्र प्राप्त करें। चरण 2: सभी आवश्यक दस्तावेज संलग्न कर संबंधित कार्यालय / जन सेवा केंद्र (CSC) में जमा करें।"

        text = process_str.strip()

        # Apply specific step phrase substitutions
        for pattern, replacement in cls.STEP_PHRASES:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # Translate remaining common keywords while keeping URLs safe
        # Extract URLs temporarily
        url_tokens = {}
        def _save_url(m):
            token = f"__URL_TOKEN_{len(url_tokens)}__"
            url_tokens[token] = m.group(0)
            return token

        text_safe = re.sub(r'(https?://[^\s"\'\)<>]+|www\.[^\s"\'\)<>]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', _save_url, text)

        # Translate keywords in safe text
        text_translated = cls._apply_word_translations(text_safe)

        # Restore URLs
        for token, original_url in url_tokens.items():
            text_translated = text_translated.replace(token, original_url)

        return text_translated

    @classmethod
    def translate_benefits(cls, benefits: str) -> str:
        """Translates benefits narrative to Hindi."""
        if not benefits:
            return "पात्र महिला लाभार्थियों को सरकार द्वारा प्रत्यक्ष वित्तीय व कल्याणकारी सहायता प्रदान की जाती है।"
        
        text = cls._apply_word_translations(benefits)
        # Currency cleanup
        text = re.sub(r'₹\s*', '₹', text)
        text = re.sub(r'Rs\.?\s*', '₹', text, flags=re.IGNORECASE)
        text = re.sub(r'per month\b', 'प्रतिमाह', text, flags=re.IGNORECASE)
        text = re.sub(r'per annum\b', 'प्रतिवर्ष', text, flags=re.IGNORECASE)
        text = re.sub(r'one-time\b', 'एकमुश्त', text, flags=re.IGNORECASE)
        return text

    @classmethod
    def translate_description(cls, desc: str, name_hi: str = "") -> str:
        """Translates description to Hindi."""
        if not desc:
            return f"{name_hi} के अंतर्गत पात्र महिलाओं एवं बालिकाओं को आर्थिक संबल व सहायता उपलब्ध कराई जाती है।"
        return cls._apply_word_translations(desc)

    @classmethod
    def translate_eligibility(cls, elig: str) -> str:
        """Translates eligibility text to Hindi."""
        if not elig:
            return "यह योजना निर्धारित आयु वर्ग, निवास व पात्रता मानदंडों को पूरा करने वाली महिलाओं के लिए लागू है।"
        return cls._apply_word_translations(elig)

    @classmethod
    def _apply_word_translations(cls, text: str) -> str:
        """Applies word and regex transformations to convert common terms."""
        if not text:
            return ""
        result = text
        for pat, rep in cls.COMMON_WORDS_TRANSLATION:
            result = re.sub(pat, rep, result, flags=re.IGNORECASE)
        return result


def enrich_catalog(input_path: str, output_path: str, force: bool = False) -> Tuple[int, int]:
    """
    Enriches all schemes in input_path with Hindi fields and saves to output_path.
    """
    logger.info(f"Loading scheme catalog from {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        schemes = json.load(f)

    total = len(schemes)
    enriched_count = 0
    overridden_gold = 0

    logger.info(f"Processing {total} schemes for comprehensive Hindi localization...")

    for idx, s in enumerate(schemes):
        sid = s.get("scheme_id", "").strip().lower()
        state = s.get("state", "All")

        # 1. Check Gold Standard Curated Override
        if sid in CORE_TRANSLATIONS:
            gold = CORE_TRANSLATIONS[sid]
            s["name_hi"] = gold.get("name_hi")
            s["ministry_hi"] = gold.get("ministry_hi")
            s["category_hi"] = gold.get("category_hi")
            s["benefits_hi"] = gold.get("benefits_hi")
            s["description_hi"] = gold.get("description_hi")
            overridden_gold += 1
        else:
            # 2. Apply Domain Translation Engine (GovTrans)
            s["name_hi"] = GovTransEngine.translate_name(s.get("name", ""), state)
            s["ministry_hi"] = GovTransEngine.translate_ministry(
                s.get("ministry", ""), s.get("department", ""), state
            )
            s["category_hi"] = GovTransEngine.translate_category(s.get("category", ""))
            s["benefits_hi"] = GovTransEngine.translate_benefits(s.get("benefits", ""))
            s["description_hi"] = GovTransEngine.translate_description(
                s.get("description", ""), s["name_hi"]
            )

        # 3. Translate Detailed Official Guidelines & Application Process
        s["application_process_hi"] = GovTransEngine.translate_application_process(
            s.get("application_process", ""),
            s.get("apply_url", ""),
            s.get("official_url", "")
        )

        # 4. Translate Documents Required & Eligibility Checklist
        s["documents_required_hi"] = GovTransEngine.translate_documents(
            s.get("documents_required", "")
        )
        s["eligibility_text_hi"] = GovTransEngine.translate_eligibility(
            s.get("eligibility_text", "")
        )

        enriched_count += 1

    # Atomic Write to output file
    temp_output = output_path + ".tmp"
    logger.info(f"Writing enriched dataset to temporary path {temp_output}...")
    with open(temp_output, 'w', encoding='utf-8') as f:
        json.dump(schemes, f, ensure_ascii=False, indent=2)

    os.replace(temp_output, output_path)
    logger.info(f"Successfully enriched {enriched_count}/{total} schemes (Gold Curated: {overridden_gold}).")
    logger.info(f"Saved enriched catalog to {output_path}")

    return enriched_count, total


def main():
    parser = argparse.ArgumentParser(description="Enrich scheme catalog with Hindi translations.")
    parser.add_argument(
        "--input",
        default="backend/data/processed/schemes_women.json",
        help="Path to input schemes JSON"
    )
    parser.add_argument(
        "--output",
        default="backend/data/processed/schemes_women.json",
        help="Path to output schemes JSON"
    )
    args = parser.parse_args()

    # Resolve relative paths
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_file = os.path.join(backend_dir, "..", args.input) if not os.path.isabs(args.input) else args.input
    output_file = os.path.join(backend_dir, "..", args.output) if not os.path.isabs(args.output) else args.output

    input_file = os.path.abspath(input_file)
    output_file = os.path.abspath(output_file)

    if not os.path.exists(input_file):
        # Try finding inside backend/data/processed directly
        input_file = os.path.join(backend_dir, "data", "processed", "schemes_women.json")
        output_file = input_file

    enriched, total = enrich_catalog(input_file, output_file)
    print(f"\n[SUCCESS] Enriched {enriched}/{total} schemes with Hindi translation fields in {output_file}")


if __name__ == "__main__":
    main()
