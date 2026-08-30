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
  presetTitle: string;
  presetSubtitle: string;
  presetReset: string;
  presetActive: string;
  presetClear: string;
  viewModeWizard: string;
  viewModeAll: string;
  validationErrorState: string;
  validationErrorAge: string;
  validationErrorIncome: string;
  fieldAgeDirectInput: string;
  fieldIncomeDirectInput: string;
  fieldAdditionalInfo: string;
  fieldOccupation: string;
  fieldEducation: string;

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
  filterLifeStage: string;
  filterLifeStageAll: string;
  sortLabel: string;
  sortHighestMatch: string;
  sortNameAsc: string;
  sortMinistryAsc: string;
  searchInResults: string;
  cardMatchScore: string;
  cardWhyYouQualify: string;
  cardKeyBenefits: string;
  cardViewDetails: string;
  cardApplyOfficial: string;
  emptyResultsTitle: string;
  emptyResultsDesc: string;
  emptyResetFilters: string;
  emptyBackToWizard: string;
  resultsProfileSummary: string;
  toastBookmarkSaved: string;
  toastBookmarkRemoved: string;

  // Scheme Detail Page
  detailBackToResults: string;
  detailNodalMinistry: string;
  detailNodalDepartment: string;
  detailKeyAttributes: string;
  detailAgeLimit: string;
  detailGender: string;
  detailCaste: string;
  detailIncomeLimit: string;
  detailNoIncomeLimit: string;
  detailResidence: string;
  detailBplPriority: string;
  detailDisabilityPriority: string;
  detailLifeStageTags: string;
  detailBenefitsTitle: string;
  detailEligibilityTitle: string;
  detailDocumentsTitle: string;
  detailDocsChecklistHelp: string;
  detailDocReady: string;
  detailDocPending: string;
  detailApplicationProcessTitle: string;
  detailOfficialPortalCTA: string;
  detailOfficialWebsite: string;
  detailSchemeNotFound: string;
  detailSchemeNotFoundDesc: string;

  // AI Explanation Component
  aiExplainTitle: string;
  aiExplainSubtitle: string;
  aiExplainLangToggle: string;
  aiExplainTriggerBtn: string;
  aiExplainLoadingTitle: string;
  aiExplainLoadingDesc: string;
  aiExplainSummaryTitle: string;
  aiExplainBenefitsTitle: string;
  aiExplainDocsTitle: string;
  aiExplainNextStepsTitle: string;
  aiExplainDisclaimerTitle: string;
  aiExplainGeminiBadge: string;
  aiExplainFallbackBadge: string;

  // Bookmarks Page & Dashboard
  bookmarksTitle: string;
  bookmarksSubtitle: string;
  bookmarksAuthPromptTitle: string;
  bookmarksAuthPromptDesc: string;
  bookmarksQuickSignIn: string;
  bookmarksCustomSignIn: string;
  bookmarksSignInBtn: string;
  bookmarksRemoveBtn: string;
  bookmarksProfileCardTitle: string;
  bookmarksProfileCardDesc: string;
  bookmarksFindWithProfile: string;
  bookmarksRefineProfile: string;
  bookmarksEmptyTitle: string;
  bookmarksEmptyDesc: string;
  bookmarksExploreBtn: string;
  bookmarksSearchPlaceholder: string;
  bookmarksCountBadge: string;

  // About Page (Ticket 6.8)
  aboutTitle: string;
  aboutSubtitle: string;
  aboutMissionHeading: string;
  aboutMissionP1: string;
  aboutMissionP2: string;
  aboutPillarsHeading: string;
  aboutDataSourcesHeading: string;
  aboutDataSourcesDesc: string;
  aboutLegalDisclaimerHeading: string;
  aboutLegalDisclaimerP1: string;
  aboutLegalDisclaimerP2: string;
  aboutLegalDisclaimerP3: string;
  aboutOfficialPortalsHeading: string;
  aboutCtaHeading: string;
  aboutCtaButton: string;

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
    presetTitle: "Load Demo Persona",
    presetSubtitle: "Instant 1-click test with real persona data",
    presetReset: "Reset to Default",
    presetActive: "Preset Active",
    presetClear: "Clear Preset",
    viewModeWizard: "Guided Steps",
    viewModeAll: "All-in-One Form",
    validationErrorState: "Please select your state or UT of residence.",
    validationErrorAge: "Please enter a valid age between 0 and 110 years.",
    validationErrorIncome: "Please enter a valid annual income (₹0 or higher).",
    fieldAgeDirectInput: "Direct Age Input",
    fieldIncomeDirectInput: "Direct Income Input (₹)",
    fieldAdditionalInfo: "Additional Demographic Details (Optional)",
    fieldOccupation: "Current Occupation",
    fieldEducation: "Highest Education Level",

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
    filterLifeStage: "Life Stage",
    filterLifeStageAll: "All Life Stages",
    sortLabel: "Sort by",
    sortHighestMatch: "Highest Match Score",
    sortNameAsc: "Scheme Name (A-Z)",
    sortMinistryAsc: "Ministry (A-Z)",
    searchInResults: "Filter schemes by keyword...",
    cardMatchScore: "Match",
    cardWhyYouQualify: "Why you qualify:",
    cardKeyBenefits: "Key Benefits:",
    cardViewDetails: "View Scheme Details",
    cardApplyOfficial: "Apply on Official Portal",
    emptyResultsTitle: "No Schemes Found for Selected Filters",
    emptyResultsDesc: "No welfare schemes currently match your active filter criteria. Try clearing search keywords or widening your filters.",
    emptyResetFilters: "Reset All Filters",
    emptyBackToWizard: "Adjust Profile in Discovery Form",
    resultsProfileSummary: "Active Demographic Profile",
    toastBookmarkSaved: "Scheme saved to your bookmarks!",
    toastBookmarkRemoved: "Scheme removed from bookmarks",

    // Scheme Detail Page
    detailBackToResults: "Back to Matched Results",
    detailNodalMinistry: "Nodal Ministry",
    detailNodalDepartment: "Department",
    detailKeyAttributes: "Eligibility Snapshot",
    detailAgeLimit: "Age Limit",
    detailGender: "Gender",
    detailCaste: "Caste / Category",
    detailIncomeLimit: "Income Ceiling",
    detailNoIncomeLimit: "No Maximum Income Limit",
    detailResidence: "Residence Scope",
    detailBplPriority: "BPL Priority",
    detailDisabilityPriority: "Disability (PwD) Priority",
    detailLifeStageTags: "Life Stages",
    detailBenefitsTitle: "Comprehensive Benefit Details",
    detailEligibilityTitle: "Official Eligibility Criteria",
    detailDocumentsTitle: "Required Document Checklist",
    detailDocsChecklistHelp: "Check off the documents you have ready before applying online:",
    detailDocReady: "Ready",
    detailDocPending: "Pending",
    detailApplicationProcessTitle: "How to Apply",
    detailOfficialPortalCTA: "Apply on Official Portal",
    detailOfficialWebsite: "Nodal Website",
    detailSchemeNotFound: "Scheme Not Found",
    detailSchemeNotFoundDesc: "The requested welfare scheme ID could not be located in our national catalog.",

    // AI Explanation Component
    aiExplainTitle: "Personalized AI Entitlement Explanation",
    aiExplainSubtitle: "Powered by Gemini AI — Plain-language reasoning translated from complex administrative guidelines",
    aiExplainLangToggle: "Explanation Language",
    aiExplainTriggerBtn: "Explain My Eligibility",
    aiExplainLoadingTitle: "Analyzing your profile with Gemini AI...",
    aiExplainLoadingDesc: "Cross-referencing scheme guidelines against your demographic criteria in plain language.",
    aiExplainSummaryTitle: "Plain-Language Eligibility Summary",
    aiExplainBenefitsTitle: "Entitlements You Will Receive",
    aiExplainDocsTitle: "Customized Verification Documents",
    aiExplainNextStepsTitle: "Next Steps to Apply",
    aiExplainDisclaimerTitle: "Official Advisory Notice",
    aiExplainGeminiBadge: "Generated by Gemini 2.5 Flash",
    aiExplainFallbackBadge: "Verified Deterministic Advisory",

    // Bookmarks Page & Dashboard
    bookmarksTitle: "My Saved Bookmarks",
    bookmarksSubtitle: "Manage your shortlisted welfare schemes and synced demographic profile",
    bookmarksAuthPromptTitle: "Sign In to Access Your Bookmarks",
    bookmarksAuthPromptDesc: "Sign in to save and sync your eligible welfare benefits across all devices.",
    bookmarksQuickSignIn: "Quick Demo Persona Sign In:",
    bookmarksCustomSignIn: "Or Sign In with Email:",
    bookmarksSignInBtn: "Sign In & Access Bookmarks",
    bookmarksRemoveBtn: "Remove Bookmark",
    bookmarksProfileCardTitle: "Saved Demographic Profile",
    bookmarksProfileCardDesc: "Used for instantaneous personalized entitlement calculations",
    bookmarksFindWithProfile: "Find Schemes with My Profile",
    bookmarksRefineProfile: "Update Profile",
    bookmarksEmptyTitle: "No Saved Bookmarks Yet",
    bookmarksEmptyDesc: "Explore our nationwide catalog to find schemes you qualify for and save them here.",
    bookmarksExploreBtn: "Discover Welfare Schemes",
    bookmarksSearchPlaceholder: "Filter saved schemes by title or keyword...",
    bookmarksCountBadge: "Saved Schemes",

    // About Page (Ticket 6.8)
    aboutTitle: "About Yojana Dvar (योजना द्वार)",
    aboutSubtitle: "Empowering 700+ million Indian women with AI-guided welfare entitlement discovery, algorithmic transparency, and plain-language guidance.",
    aboutMissionHeading: "Project Mission & Vision",
    aboutMissionP1: "India maintains one of the world's most extensive social welfare safety nets, offering hundreds of central and state government schemes designed to uplift women across health, education, livelihood, maternity, and social security. However, complex eligibility guidelines, dense administrative jargon, and fragmented portals prevent millions of eligible beneficiaries from accessing the entitlements they rightfully deserve.",
    aboutMissionP2: "Yojana Dvar (योजना द्वार) was created to bridge this critical discovery gap. Built as an open-source civic technology platform, it empowers citizens to input simple demographic attributes and instantaneously uncover welfare schemes they qualify for, accompanied by clear plain-language explanations in English and हिंदी.",
    aboutPillarsHeading: "Core Architectural Pillars",
    aboutDataSourcesHeading: "Data Sources & Public Attribution",
    aboutDataSourcesDesc: "Our catalog is synthesized and cross-verified against official Indian government public domains and open data repositories. We gratefully attribute scheme metadata to:",
    aboutLegalDisclaimerHeading: "Explicit Legal Advisory & Disclaimer",
    aboutLegalDisclaimerP1: "Important Notice: Yojana Dvar is an independent open-source civic technology platform developed for public informational purposes. It is NOT an official government agency, department, or disbursement authority.",
    aboutLegalDisclaimerP2: "Yojana Dvar does NOT collect application fees, does NOT process monetary transactions, does NOT issue approvals, and does NOT distribute benefits. All entitlement eligibility, quotas, budget sanction, and final disbursements are determined solely by the competent authorities of the Government of India and respective State Governments.",
    aboutLegalDisclaimerP3: "Citizens must always submit their official applications and verify current eligibility guidelines on the designated nodal government portals (*.gov.in and *.nic.in). Yojana Dvar provides direct external links to these official portals for every listed scheme.",
    aboutOfficialPortalsHeading: "Recognized Official Portals",
    aboutCtaHeading: "Ready to Discover Your Eligible Entitlements?",
    aboutCtaButton: "Find Schemes with Discovery Form",

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
    presetTitle: "डेमो प्रोफाइल लोड करें",
    presetSubtitle: "वास्तविक प्रोफाइल डेटा के साथ 1-क्लिक त्वरित परीक्षण",
    presetReset: "डिफ़ॉल्ट पर रीसेट करें",
    presetActive: "प्रीसेट सक्रिय",
    presetClear: "प्रीसेट हटाएं",
    viewModeWizard: "मार्गदर्शित चरण",
    viewModeAll: "सभी प्रश्न एक साथ",
    validationErrorState: "कृपया अपना निवास राज्य या केंद्र शासित प्रदेश चुनें।",
    validationErrorAge: "कृपया 0 से 110 वर्ष के बीच एक मान्य आयु दर्ज करें।",
    validationErrorIncome: "कृपया मान्य वार्षिक आय दर्ज करें (₹0 या अधिक)।",
    fieldAgeDirectInput: "सीधे आयु दर्ज करें",
    fieldIncomeDirectInput: "सीधे आय दर्ज करें (₹)",
    fieldAdditionalInfo: "अतिरिक्त जनसांख्यिकीय विवरण (वैकल्पिक)",
    fieldOccupation: "वर्तमान व्यवसाय",
    fieldEducation: "उच्चतम शिक्षा स्तर",

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
    filterLifeStage: "जीवन चरण",
    filterLifeStageAll: "सभी जीवन चरण",
    sortLabel: "क्रमबद्ध करें",
    sortHighestMatch: "उच्चतम पात्रता स्कोर",
    sortNameAsc: "योजना का नाम (A-Z)",
    sortMinistryAsc: "मंत्रालय (A-Z)",
    searchInResults: "कीवर्ड द्वारा फ़िल्टर करें...",
    cardMatchScore: "पात्रता",
    cardWhyYouQualify: "आप क्यों पात्र हैं:",
    cardKeyBenefits: "मुख्य लाभ:",
    cardViewDetails: "योजना का पूर्ण विवरण",
    cardApplyOfficial: "आधिकारिक पोर्टल पर आवेदन करें",
    emptyResultsTitle: "चयनित फ़िल्टर के लिए कोई योजना नहीं मिली",
    emptyResultsDesc: "वर्तमान में आपकी फ़िल्टर शर्तों से कोई योजना मेल नहीं खाती। कृपया फ़िल्टर रीसेट करें या प्रोफ़ाइल बदलें।",
    emptyResetFilters: "सभी फ़िल्टर रीसेट करें",
    emptyBackToWizard: "खोज फ़ॉर्म में प्रोफ़ाइल बदलें",
    resultsProfileSummary: "सक्रिय जनसांख्यिकीय प्रोफ़ाइल",
    toastBookmarkSaved: "योजना आपकी सहेजी गई सूची में जोड़ी गई!",
    toastBookmarkRemoved: "योजना सहेजी गई सूची से हटाई गई",

    // Scheme Detail Page
    detailBackToResults: "परिणामों पर वापस जाएं",
    detailNodalMinistry: "नोडल मंत्रालय",
    detailNodalDepartment: "विभाग",
    detailKeyAttributes: "पात्रता संक्षिप्त विवरण",
    detailAgeLimit: "आयु सीमा",
    detailGender: "लिंग",
    detailCaste: "जाति / सामाजिक श्रेणी",
    detailIncomeLimit: "वार्षिक आय सीमा",
    detailNoIncomeLimit: "कोई अधिकतम आय सीमा नहीं",
    detailResidence: "निवास क्षेत्र",
    detailBplPriority: "बीपीएल प्राथमिकता",
    detailDisabilityPriority: "दिव्यांगता (PwD) प्राथमिकता",
    detailLifeStageTags: "जीवन चरण",
    detailBenefitsTitle: "विस्तृत लाभ एवं वित्तीय सहायता",
    detailEligibilityTitle: "आधिकारिक पात्रता दिशानिर्देश",
    detailDocumentsTitle: "आवश्यक दस्तावेजों की चेकलिस्ट",
    detailDocsChecklistHelp: "आवेदन करने से पहले अपने उपलब्ध दस्तावेजों पर सही का निशान लगाएं:",
    detailDocReady: "तैयार",
    detailDocPending: "शेष",
    detailApplicationProcessTitle: "आवेदन की प्रक्रिया",
    detailOfficialPortalCTA: "आधिकारिक पोर्टल पर आवेदन करें",
    detailOfficialWebsite: "आधिकारिक वेबसाइट",
    detailSchemeNotFound: "योजना नहीं मिली",
    detailSchemeNotFoundDesc: "अनुरोधित सरकारी योजना हमारे राष्ट्रीय कैटलॉग में नहीं मिली।",

    // AI Explanation Component
    aiExplainTitle: "व्यक्तिगत एआई पात्रता स्पष्टीकरण",
    aiExplainSubtitle: "जेमिनी एआई द्वारा संचालित — जटिल सरकारी नियमों का आपकी सरल भाषा में स्पष्टीकरण",
    aiExplainLangToggle: "स्पष्टीकरण की भाषा",
    aiExplainTriggerBtn: "मेरी पात्रता एआई से समझें",
    aiExplainLoadingTitle: "जेमिनी एआई द्वारा आपकी प्रोफ़ाइल का विश्लेषण किया जा रहा है...",
    aiExplainLoadingDesc: "आपकी आयु, निवास और जीवन चरण के आधार पर सरल भाषा में व्याख्या तैयार हो रही है।",
    aiExplainSummaryTitle: "सरल भाषा में पात्रता सारांश",
    aiExplainBenefitsTitle: "आपको मिलने वाले मुख्य लाभ",
    aiExplainDocsTitle: "आपके लिए आवश्यक दस्तावेज",
    aiExplainNextStepsTitle: "आवेदन करने के अगले चरण",
    aiExplainDisclaimerTitle: "आधिकारिक सलाह सूचना",
    aiExplainGeminiBadge: "जेमिनी 2.5 फ्लैश द्वारा उत्पन्न",
    aiExplainFallbackBadge: "सत्यापित प्रशासनिक सलाह",

    // Bookmarks Page & Dashboard
    bookmarksTitle: "मेरी सहेजी गई योजनाएं",
    bookmarksSubtitle: "अपनी पसंदीदा योजनाओं और सहेजी गई प्रोफ़ाइल को प्रबंधित करें",
    bookmarksAuthPromptTitle: "अपनी सहेजी गई योजनाएं देखने के लिए साइन इन करें",
    bookmarksAuthPromptDesc: "सभी डिवाइसों पर अपनी पात्र योजनाओं और प्रोफ़ाइल को सुरक्षित रखने के लिए साइन इन करें।",
    bookmarksQuickSignIn: "त्वरित डेमो प्रोफ़ाइल लॉगिन:",
    bookmarksCustomSignIn: "या ईमेल द्वारा लॉगिन करें:",
    bookmarksSignInBtn: "लॉगिन करें और सहेजी गई योजनाएं देखें",
    bookmarksRemoveBtn: "सहेजी गई सूची से हटाएं",
    bookmarksProfileCardTitle: "सहेजी गई जनसांख्यिकीय प्रोफ़ाइल",
    bookmarksProfileCardDesc: "पात्रता की त्वरित व्यक्तिगत गणना हेतु उपयोग की जाने वाली प्रोफ़ाइल",
    bookmarksFindWithProfile: "मेरी प्रोफ़ाइल से योजनाएं खोजें",
    bookmarksRefineProfile: "प्रोफ़ाइल अपडेट करें",
    bookmarksEmptyTitle: "अभी तक कोई योजना सहेजी नहीं गई है",
    bookmarksEmptyDesc: "अपनी पात्रता जांचने के लिए योजनाओं का अन्वेषण करें और उन्हें यहाँ सहेजें।",
    bookmarksExploreBtn: "सरकारी योजनाएं खोजें",
    bookmarksSearchPlaceholder: "सहेजी गई योजनाओं में खोजें...",
    bookmarksCountBadge: "सहेजी गई योजनाएं",

    // About Page (Ticket 6.8)
    aboutTitle: "योजना द्वार (Yojana Dvar) के बारे में",
    aboutSubtitle: "एआई-संचालित योजना खोज, पारदर्शी एल्गोरिदम और सरल भाषा मार्गदर्शन के साथ 70 करोड़ से अधिक भारतीय महिलाओं का सशक्तिकरण।",
    aboutMissionHeading: "परियोजना का उद्देश्य एवं विजन",
    aboutMissionP1: "भारत सरकार और राज्य सरकारों द्वारा महिलाओं के शिक्षा, मातृत्व, आजीविका, स्वास्थ्य और सामाजिक सुरक्षा के लिए सैकड़ों कल्याणकारी योजनाएं चलाई जा रही हैं। परंतु जटिल प्रशासनिक शब्दावली, लंबी शर्तें और बिखरे हुए पोर्टलों के कारण करोड़ों पात्र महिलाएं इन अधिकारों से वंचित रह जाती हैं।",
    aboutMissionP2: "योजना द्वार (Yojana Dvar) इसी अंतिम छोर की दूरी को पाटने के लिए बनाया गया एक मुक्त-स्रोत (Open-Source) जन-कल्याण मंच है। यहाँ नागरिक सरल जनसांख्यिकीय विवरण दर्ज करके तुरंत अपनी पात्र योजनाओं को खोज सकते हैं और जेमिनी एआई की मदद से हिंदी व अंग्रेजी में अपनी भाषा में समझ सकते हैं।",
    aboutPillarsHeading: "मूल तकनीकी स्तंभ",
    aboutDataSourcesHeading: "डेटा स्रोत एवं सार्वजनिक श्रेय",
    aboutDataSourcesDesc: "हमारा योजना कैटलॉग भारत सरकार के आधिकारिक सार्वजनिक डोमेन और ओपन डेटा रिपॉजिटरी से एकत्रित और सत्यापित किया गया है:",
    aboutLegalDisclaimerHeading: "विशिष्ट कानूनी सलाह एवं सार्वजनिक अस्वीकरण",
    aboutLegalDisclaimerP1: "महत्वपूर्ण सूचना: योजना द्वार एक स्वतंत्र ओपन-सोर्स नागरिक तकनीक मंच है जो केवल जन-सूचना और जागरूकता के उद्देश्य से बनाया गया है। यह कोई आधिकारिक सरकारी एजेंसी, विभाग या संवितरण प्राधिकरण नहीं है।",
    aboutLegalDisclaimerP2: "योजना द्वार किसी भी प्रकार का आवेदन शुल्क नहीं लेता, कोई वित्तीय लेन-देन नहीं करता और न ही प्रत्यक्ष लाभ वितरित करता है। किसी भी योजना की अंतिम पात्रता, बजट आवंटन और लाभ संवितरण का पूर्ण अधिकार केवल संबंधित केंद्र एवं राज्य सरकार के प्राधिकारियों के पास सुरक्षित है।",
    aboutLegalDisclaimerP3: "नागरिकों को हमेशा संबंधित आधिकारिक सरकारी पोर्टलों (*.gov.in और *.nic.in) पर जाकर ही अंतिम पात्रता की पुष्टि करनी चाहिए और आवेदन प्रस्तुत करना चाहिए। योजना द्वार प्रत्येक योजना के लिए आधिकारिक पोर्टल का सीधा लिंक प्रदान करता है।",
    aboutOfficialPortalsHeading: "मान्यता प्राप्त सरकारी पोर्टल",
    aboutCtaHeading: "क्या आप अपने कल्याणकारी अधिकारों को खोजने के लिए तैयार हैं?",
    aboutCtaButton: "पात्र योजनाएं खोजें",

    footerDisclaimer: "अस्वीकरण: योजना द्वार एक सूचनात्मक मंच है, सरकारी एजेंसी नहीं। पात्रता व लाभ की अंतिम पुष्टि संबंधित आधिकारिक सरकारी पोर्टल पर की जानी चाहिए।",
    footerRights: "© 2026 योजना द्वार। भारतीय महिला कल्याण और डिजिटल समावेशन के लिए समर्पित।",
    footerGovtPortals: "सरकारी पोर्टल: myScheme.gov.in • महिला एवं बाल विकास मंत्रालय • डिजिटल इंडिया",
    footerAbout: "योजना द्वार के बारे में",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerAccessibility: "सुलभता मानक (WCAG 2.1 AA)"
  }
};
