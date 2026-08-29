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

  // Wizard Stepper & Steps
  wizardTitle: string;
  wizardSubtitle: string;
  wizardPersonaLoaded: string;
  wizardStep1Title: string;
  wizardStep1Subtitle: string;
  wizardStep2Title: string;
  wizardStep2Subtitle: string;
  wizardStep3Title: string;
  wizardStep3Subtitle: string;
  wizardStep4Title: string;
  wizardStep4Subtitle: string;

  // Wizard Form Fields
  fieldState: string;
  fieldStatePlaceholder: string;
  fieldAge: string;
  fieldAgeHelper: string;
  fieldGender: string;
  fieldGenderFemale: string;
  fieldGenderTransgender: string;
  fieldGenderAll: string;

  fieldCaste: string;
  fieldIncome: string;
  fieldIncomeHelper: string;
  fieldResidence: string;
  fieldResidenceRural: string;
  fieldResidenceUrban: string;
  fieldResidenceSemiUrban: string;
  fieldResidenceAll: string;

  fieldLifeStage: string;
  fieldLifeStageStudent: string;
  fieldLifeStageMaternal: string;
  fieldLifeStageEntrepreneur: string;
  fieldLifeStageSenior: string;
  fieldLifeStageGeneral: string;

  fieldBpl: string;
  fieldBplHelper: string;
  fieldDisability: string;
  fieldDisabilityHelper: string;
  fieldYes: string;
  fieldNo: string;

  // Wizard Review & Submit
  wizardSummaryTitle: string;
  wizardSummarySubtitle: string;
  wizardEdit: string;
  wizardSubmitBtn: string;
  wizardMatchingLoading: string;

  // Results Page & SchemeCard
  resultsTitle: string;
  resultsSubtitle: string;
  resultsFoundCount: string;
  resultsExecutionTime: string;
  resultsRefineProfile: string;
  filterAllCategories: string;
  filterCategory: string;
  filterScope: string;
  filterScopeAll: string;
  filterScopeCentral: string;
  filterScopeState: string;
  sortLabel: string;
  sortHighestMatch: string;
  sortNameAsc: string;
  searchInResults: string;
  cardMatchScore: string;
  cardWhyYouQualify: string;
  cardKeyBenefits: string;
  cardViewDetails: string;
  emptyResultsTitle: string;
  emptyResultsDesc: string;
  emptyResetFilters: string;
  emptyBackToWizard: string;

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

    // Wizard
    wizardTitle: "Scheme Eligibility Wizard",
    wizardSubtitle: "Answer a few simple questions to find all government welfare benefits you qualify for.",
    wizardPersonaLoaded: "Demo persona pre-loaded. Feel free to adjust any fields or proceed.",
    wizardStep1Title: "Basic Information",
    wizardStep1Subtitle: "State of residence, age, and gender identity",
    wizardStep2Title: "Socio-Economic Profile",
    wizardStep2Subtitle: "Caste category, family income, and residence location",
    wizardStep3Title: "Life Stage & Priority Status",
    wizardStep3Subtitle: "Current stage of life, ration card, and disability status",
    wizardStep4Title: "Review & Find Schemes",
    wizardStep4Subtitle: "Confirm your demographic profile to calculate eligibility",

    fieldState: "Select Your State / UT",
    fieldStatePlaceholder: "-- Choose your State --",
    fieldAge: "Your Age (in Years)",
    fieldAgeHelper: "Schemes have specific age criteria (e.g. 0-10 for SSY, 19-45 for PMMVY)",
    fieldGender: "Gender",
    fieldGenderFemale: "Female (महिला)",
    fieldGenderTransgender: "Transgender (किन्नर / तृतीय लिंग)",
    fieldGenderAll: "All (सभी)",

    fieldCaste: "Social Category / Caste",
    fieldIncome: "Annual Household Income (₹)",
    fieldIncomeHelper: "Estimated yearly income of your immediate family",
    fieldResidence: "Residence Area",
    fieldResidenceRural: "Rural (गाँव / Rural)",
    fieldResidenceUrban: "Urban (शहर / Urban)",
    fieldResidenceSemiUrban: "Semi-Urban (कस्बा)",
    fieldResidenceAll: "Any / All Area",

    fieldLifeStage: "Current Life Stage",
    fieldLifeStageStudent: "Student / Education",
    fieldLifeStageMaternal: "Pregnant / Lactating Mother",
    fieldLifeStageEntrepreneur: "Self-Employed / Business",
    fieldLifeStageSenior: "Widow / Senior Citizen",
    fieldLifeStageGeneral: "General / Other",

    fieldBpl: "Do you hold a Below Poverty Line (BPL) or Antyodaya Ration Card?",
    fieldBplHelper: "Many central schemes offer priority grants to BPL families",
    fieldDisability: "Do you have a recognized Disability (PwD)?",
    fieldDisabilityHelper: "40%+ benchmark disability qualifies for special assistive pensions and devices",
    fieldYes: "Yes (हाँ)",
    fieldNo: "No (नहीं)",

    wizardSummaryTitle: "Summary of Your Profile",
    wizardSummarySubtitle: "Our 9-rule match engine will filter and rank schemes against these parameters",
    wizardEdit: "Edit",
    wizardSubmitBtn: "Find My Eligible Schemes",
    wizardMatchingLoading: "Matching against 100+ schemes with 9-rule engine...",

    // Results Page
    resultsTitle: "Your Eligible Welfare Schemes",
    resultsSubtitle: "Ranked by our 9-rule deterministic engine based on your demographic profile",
    resultsFoundCount: "Eligible Schemes Found",
    resultsExecutionTime: "Matched in",
    resultsRefineProfile: "Refine Profile in Wizard",
    filterAllCategories: "All Categories",
    filterCategory: "Category",
    filterScope: "Scope",
    filterScopeAll: "All Schemes",
    filterScopeCentral: "Central Only",
    filterScopeState: "State Only",
    sortLabel: "Sort by",
    sortHighestMatch: "Highest Match Score",
    sortNameAsc: "Scheme Name (A-Z)",
    searchInResults: "Filter schemes by keyword...",
    cardMatchScore: "Match",
    cardWhyYouQualify: "Why you qualify:",
    cardKeyBenefits: "Key Benefits:",
    cardViewDetails: "View Scheme Details",
    emptyResultsTitle: "No Schemes Found for Selected Filters",
    emptyResultsDesc: "No welfare schemes currently match your active filter criteria. Try clearing search keywords or widening your filters.",
    emptyResetFilters: "Reset All Filters",
    emptyBackToWizard: "Adjust Profile in Wizard",

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

    // Wizard
    wizardTitle: "सरकारी योजना पात्रता विज़ार्ड",
    wizardSubtitle: "कुछ सरल प्रश्नों के उत्तर दें और उन सभी योजनाओं की सूची पाएं जिनके लिए आप पात्र हैं।",
    wizardPersonaLoaded: "डेमो प्रोफाइल लोड हो गई है। आप इसे अपनी आवश्यकता अनुसार बदल सकते हैं।",
    wizardStep1Title: "बुनियादी जानकारी",
    wizardStep1Subtitle: "निवास राज्य, आपकी आयु और लिंग",
    wizardStep2Title: "सामाजिक एवं आर्थिक स्थिति",
    wizardStep2Subtitle: "जाति श्रेणी, वार्षिक पारिवारिक आय और निवास क्षेत्र",
    wizardStep3Title: "जीवन का चरण एवं विशेष प्राथमिकता",
    wizardStep3Subtitle: "वर्तमान जीवन चरण, बीपीएल राशन कार्ड और दिव्यांगता स्थिति",
    wizardStep4Title: "पुष्टि करें और योजनाएं खोजें",
    wizardStep4Subtitle: "अपनी पात्रता जांचने के लिए दर्ज की गई जानकारी की पुष्टि करें",

    fieldState: "अपना राज्य / केंद्रशासित प्रदेश चुनें",
    fieldStatePlaceholder: "-- अपना राज्य चुनें --",
    fieldAge: "आपकी आयु (वर्ष में)",
    fieldAgeHelper: "योजनाओं में विशिष्ट आयु सीमा होती है (जैसे सुकन्या के लिए 0-10, PMMVY के लिए 19-45 वर्ष)",
    fieldGender: "लिंग",
    fieldGenderFemale: "महिला (Female)",
    fieldGenderTransgender: "किन्नर / तृतीय लिंग (Transgender)",
    fieldGenderAll: "सभी (All)",

    fieldCaste: "सामाजिक श्रेणी / जाति",
    fieldIncome: "वार्षिक पारिवारिक आय (₹)",
    fieldIncomeHelper: "आपके परिवार की कुल अनुमानित वार्षिक कमाई",
    fieldResidence: "निवास क्षेत्र",
    fieldResidenceRural: "ग्रामीण (गाँव / Rural)",
    fieldResidenceUrban: "शहरी (शहर / Urban)",
    fieldResidenceSemiUrban: "कस्बा (Semi-Urban)",
    fieldResidenceAll: "कोई भी क्षेत्र (All)",

    fieldLifeStage: "जीवन का मुख्य चरण",
    fieldLifeStageStudent: "छात्रा / उच्च शिक्षा (Student)",
    fieldLifeStageMaternal: "गर्भवती / धात्री माता (Maternal)",
    fieldLifeStageEntrepreneur: "महिला उद्यमी / स्व-रोजगार (Business)",
    fieldLifeStageSenior: "वरिष्ठ नागरिक / विधवा (Senior)",
    fieldLifeStageGeneral: "सामान्य / अन्य (General)",

    fieldBpl: "क्या आपके पास बीपीएल (BPL) या अंत्योदय राशन कार्ड है?",
    fieldBplHelper: "कई केंद्रीय योजनाओं में बीपीएल परिवारों को सीधी प्राथमिकता मिलती है",
    fieldDisability: "क्या आप दिव्यांग (PwD) श्रेणी में आते हैं?",
    fieldDisabilityHelper: "40% या अधिक दिव्यांगता पर विशेष सहायता पेंशन व उपकरण उपलब्ध हैं",
    fieldYes: "हाँ (Yes)",
    fieldNo: "नहीं (No)",

    wizardSummaryTitle: "आपकी प्रोफ़ाइल का सारांश",
    wizardSummarySubtitle: "हमारा 9-नियम इंजन इन विवरणों के आधार पर योजनाओं की गणना करेगा",
    wizardEdit: "संपादित करें",
    wizardSubmitBtn: "मेरी पात्र योजनाएं खोजें",
    wizardMatchingLoading: "100+ योजनाओं और 9 नियमों से आपकी पात्रता जांची जा रही है...",

    // Results Page
    resultsTitle: "आपकी पात्र सरकारी योजनाएं",
    resultsSubtitle: "आपकी जनसांख्यिकीय प्रोफ़ाइल के आधार पर 9-नियम इंजन द्वारा क्रमबद्ध",
    resultsFoundCount: "पात्र योजनाएं मिलीं",
    resultsExecutionTime: "गणना समय:",
    resultsRefineProfile: "विज़ार्ड में प्रोफ़ाइल बदलें",
    filterAllCategories: "सभी श्रेणियां",
    filterCategory: "श्रेणी",
    filterScope: "दायरा",
    filterScopeAll: "सभी योजनाएं",
    filterScopeCentral: "केवल केंद्रीय",
    filterScopeState: "केवल राज्य",
    sortLabel: "क्रमबद्ध करें",
    sortHighestMatch: "उच्चतम पात्रता स्कोर",
    sortNameAsc: "योजना का नाम (A-Z)",
    searchInResults: "कीवर्ड द्वारा फ़िल्टर करें...",
    cardMatchScore: "पात्रता",
    cardWhyYouQualify: "आप क्यों पात्र हैं:",
    cardKeyBenefits: "मुख्य लाभ:",
    cardViewDetails: "योजना का पूर्ण विवरण",
    emptyResultsTitle: "चयनित फ़िल्टर के लिए कोई योजना नहीं मिली",
    emptyResultsDesc: "वर्तमान में आपकी फ़िल्टर शर्तों से कोई योजना मेल नहीं खाती। कृपया फ़िल्टर रीसेट करें या विज़ार्ड में प्रोफ़ाइल बदलें।",
    emptyResetFilters: "सभी फ़िल्टर रीसेट करें",
    emptyBackToWizard: "विज़ार्ड में प्रोफ़ाइल बदलें",

    footerDisclaimer: "अस्वीकरण: योजना द्वार एक सूचनात्मक मंच है, सरकारी एजेंसी नहीं। पात्रता व लाभ की अंतिम पुष्टि संबंधित आधिकारिक सरकारी पोर्टल पर की जानी चाहिए।",
    footerRights: "© 2026 योजना द्वार। भारतीय महिला कल्याण और डिजिटल समावेशन के लिए समर्पित।",
    footerGovtPortals: "सरकारी पोर्टल: myScheme.gov.in • महिला एवं बाल विकास मंत्रालय • डिजिटल इंडिया",
    footerAbout: "योजना द्वार के बारे में",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerAccessibility: "सुलभता मानक (WCAG 2.1 AA)"
  }
};
