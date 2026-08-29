export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  // Navigation
  navBrand: string;
  navSubtitle: string;
  navHome: string;
  navFindSchemes: string;
  navBookmarks: string;
  navProfile: string;
  navSignIn: string;
  navSignOut: string;
  navGuest: string;

  // Hero section
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  heroSearchButton: string;
  heroVoiceTooltip: string;
  heroStartWizard: string;

  // Key stats
  statTotalSchemes: string;
  statTotalSchemesSub: string;
  statDirectBenefits: string;
  statDirectBenefitsSub: string;
  statFastMatching: string;
  statFastMatchingSub: string;

  // Demo Personas Section
  personaTitle: string;
  personaSubtitle: string;
  personaTryNow: string;
  personaMatchMe: string;

  // Life Stages Section
  lifeStageTitle: string;
  lifeStageSubtitle: string;
  stageStudent: string;
  stageStudentDesc: string;
  stageMaternal: string;
  stageMaternalDesc: string;
  stageEntrepreneur: string;
  stageEntrepreneurDesc: string;
  stageSenior: string;
  stageSeniorDesc: string;

  // Common buttons & badges
  btnExploreAll: string;
  btnBack: string;
  btnNext: string;
  btnApply: string;
  btnExplain: string;
  btnBookmark: string;
  btnBookmarked: string;
  tagEligible: string;
  tagCentral: string;
  tagState: string;

  // Footer & Disclaimer
  footerDisclaimer: string;
  footerRights: string;
  footerGovtPortals: string;
  footerAbout: string;
  footerPrivacy: string;
  footerTerms: string;
  footerAccessibility: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    navBrand: "Yojana Dvar",
    navSubtitle: "Women Entitlement Gateway",
    navHome: "Home",
    navFindSchemes: "Find Schemes",
    navBookmarks: "My Bookmarks",
    navProfile: "My Profile",
    navSignIn: "Sign In",
    navSignOut: "Sign Out",
    navGuest: "Guest User",

    heroTitle: "Empowering Every Woman With",
    heroHighlight: "Her Rightful Entitlements",
    heroSubtitle: "Discover central and state welfare schemes tailored to your age, life stage, state, and income in seconds. Voice-enabled, bilingual, and free.",
    heroSearchPlaceholder: "Search by keyword, scheme name, or benefits...",
    heroSearchButton: "Search",
    heroVoiceTooltip: "Click to speak in Hindi or English",
    heroStartWizard: "Check Eligibility (2 Mins)",

    statTotalSchemes: "100+ Welfare Schemes",
    statTotalSchemesSub: "Across 28 States & Central Ministries",
    statDirectBenefits: "Direct DBT Cash Grants",
    statDirectBenefitsSub: "Scholarships, maternity aid & micro-loans",
    statFastMatching: "Sub-Second Matching",
    statFastMatchingSub: "9-rule deterministic engine + AI guidance",

    personaTitle: "Test With 1-Click Demo Profiles",
    personaSubtitle: "Experience instant personalized scheme matching with real-world Indian demographic scenarios.",
    personaTryNow: "Test this Profile",
    personaMatchMe: "Run Match",

    lifeStageTitle: "Schemes For Every Stage of Life",
    lifeStageSubtitle: "From girl child education to maternal care, enterprise funding, and senior pension.",
    stageStudent: "Higher Education & Skills",
    stageStudentDesc: "Tuition fee waivers, monthly stipends, and STEM fellowships for girls and women.",
    stageMaternal: "Maternal & Child Health",
    stageMaternalDesc: "Nutritional grants (PMMVY), institutional delivery assistance, and infant care kits.",
    stageEntrepreneur: "Livelihood & Entrepreneurship",
    stageEntrepreneurDesc: "Zero-collateral Mudra loans, self-help group revolving funds, and artisan support.",
    stageSenior: "Widow & Senior Welfare",
    stageSeniorDesc: "Monthly social security pensions, healthcare coverage (Ayushman), and safe housing.",

    btnExploreAll: "Explore All Schemes",
    btnBack: "Back",
    btnNext: "Next Step",
    btnApply: "Official Portal",
    btnExplain: "Explain with AI",
    btnBookmark: "Bookmark",
    btnBookmarked: "Bookmarked",
    tagEligible: "100% Eligible",
    tagCentral: "Central Scheme",
    tagState: "State Scheme",

    footerDisclaimer: "Disclaimer: Yojana Dvar is an informational gateway and not an official government agency. Eligibility criteria and disbursements are subject to official guidelines on respective nodal portals.",
    footerRights: "© 2026 Yojana Dvar. Open-source civic tech built for Indian women welfare empowerment.",
    footerGovtPortals: "Official Portals: myScheme.gov.in • Ministry of Women & Child Development • Digital India",
    footerAbout: "About Yojana Dvar",
    footerPrivacy: "Data Privacy",
    footerTerms: "Terms of Use",
    footerAccessibility: "Web Accessibility (WCAG 2.1 AA)"
  },
  hi: {
    navBrand: "योजना द्वार",
    navSubtitle: "महिला कल्याण अधिकार मंच",
    navHome: "मुख्य पृष्ठ",
    navFindSchemes: "योजनाएं खोजें",
    navBookmarks: "सहेजी गई योजनाएं",
    navProfile: "मेरी प्रोफ़ाइल",
    navSignIn: "लॉग इन करें",
    navSignOut: "लॉग आउट",
    navGuest: "अतिथि उपयोगकर्ता",

    heroTitle: "हर भारतीय महिला को मिले",
    heroHighlight: "उसका सरकारी अधिकार",
    heroSubtitle: "अपनी आयु, राज्य, आय और जीवन चरण के अनुसार केंद्र व राज्य सरकार की कल्याणकारी योजनाओं की तुरंत खोज करें। आवाज़ और हिंदी में सुलभ।",
    heroSearchPlaceholder: "योजना का नाम, लाभ या कीवर्ड खोजें...",
    heroSearchButton: "खोजें",
    heroVoiceTooltip: "हिंदी या अंग्रेजी में बोलने के लिए क्लिक करें",
    heroStartWizard: "पात्रता जांचें (2 मिनट)",

    statTotalSchemes: "100+ कल्याणकारी योजनाएं",
    statTotalSchemesSub: "28 राज्यों और केंद्रीय मंत्रालयों से",
    statDirectBenefits: "प्रत्यक्ष डीबीटी बैंक अनुदान",
    statDirectBenefitsSub: "छात्रवृत्ति, मातृत्व सहायता और सूक्ष्म ऋण",
    statFastMatching: "तुरंत पात्रता मिलान",
    statFastMatchingSub: "9-नियम इंजन और एआई स्पष्टीकरण",

    personaTitle: "1-क्लिक डेमो प्रोफाइल से जांचें",
    personaSubtitle: "भारतीय महिलाओं की वास्तविक परिस्थितियों के आधार पर तुरंत पात्रता जांच का अनुभव करें।",
    personaTryNow: "इस प्रोफाइल से देखें",
    personaMatchMe: "पात्रता निकालें",

    lifeStageTitle: "जीवन के हर पड़ाव के लिए योजनाएं",
    lifeStageSubtitle: "बालिका शिक्षा से लेकर मातृत्व स्वास्थ्य, आजीविका और वरिष्ठ नागरिक पेंशन तक।",
    stageStudent: "उच्च शिक्षा एवं कौशल",
    stageStudentDesc: "बालिकाओं के लिए निःशुल्क शिक्षा, मासिक वजीफा और तकनीकी छात्रवृत्ति।",
    stageMaternal: "मातृत्व एवं शिशु देखभाल",
    stageMaternalDesc: "मातृ वंदना योजना (PMMVY) अनुदान, पोषण किट और अस्पताल सहायता।",
    stageEntrepreneur: "आजीविका एवं स्व-रोजगार",
    stageEntrepreneurDesc: "बिना गारंटी मुद्रा ऋण, स्वयं सहायता समूह (SHG) सहायता और सिलाई प्रशिक्षण।",
    stageSenior: "विधवा एवं वृद्धावस्था कल्याण",
    stageSeniorDesc: "मासिक पेंशन, आयुष्मान भारत मुफ्त इलाज और सखी निवास सुरक्षित आश्रय।",

    btnExploreAll: "सभी योजनाएं देखें",
    btnBack: "पीछे जाएं",
    btnNext: "आगे बढ़ें",
    btnApply: "आधिकारिक पोर्टल",
    btnExplain: "एआई से समझें",
    btnBookmark: "सहेजें",
    btnBookmarked: "सहेजा गया",
    tagEligible: "100% पात्र",
    tagCentral: "केंद्रीय योजना",
    tagState: "राज्य योजना",

    footerDisclaimer: "अस्वीकरण: योजना द्वार एक सूचनात्मक मंच है, सरकारी एजेंसी नहीं। पात्रता व लाभ की अंतिम पुष्टि संबंधित आधिकारिक सरकारी पोर्टल पर की जानी चाहिए।",
    footerRights: "© 2026 योजना द्वार। भारतीय महिला कल्याण और डिजिटल समावेशन के लिए समर्पित।",
    footerGovtPortals: "सरकारी पोर्टल: myScheme.gov.in • महिला एवं बाल विकास मंत्रालय • डिजिटल इंडिया",
    footerAbout: "योजना द्वार के बारे में",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerAccessibility: "सुलभता मानक (WCAG 2.1 AA)"
  }
};
