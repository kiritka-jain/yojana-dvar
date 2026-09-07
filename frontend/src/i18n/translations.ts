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
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  heroSearchButton: string;
  heroVoiceTooltip: string;
  voiceListeningAlert: string;
  heroStartWizard: string;
  heroQuickSearch: string;
  heroChipScholarship: string;
  heroChipMaternity: string;
  heroChipBusiness: string;
  heroChipPension: string;
  heroDirectWizardPrompt: string;
  ctaBannerTitle: string;
  ctaBannerSubtitle: string;
  badgeQuickTime: string;
  badgeFreeService: string;
  badgeNoLogin: string;

  // Key stats & Trust Badges
  statFreeAccess: string;
  statFreeAccessSub: string;
  statGovtSchemes: string;
  statGovtSchemesSub: string;
  statNoAadhaar: string;
  statNoAadhaarSub: string;
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
  badgeEligible: string;
  badgeEligibleShort: string;
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
  casteGeneral: string;
  casteObc: string;
  casteSc: string;
  casteSt: string;
  casteMinorities: string;

  fieldIncome: string;
  fieldIncomeHelper: string;
  incomeTierBpl: string;
  incomeTierBplDesc: string;
  incomeTierLow: string;
  incomeTierLowDesc: string;
  incomeTierMid: string;
  incomeTierMidDesc: string;
  incomeTierHigh: string;
  incomeTierHighDesc: string;
  ageTierChild: string;
  ageTierStudent: string;
  ageTierAdult: string;
  ageTierSenior: string;
  ageNewbornLabel: string;

  fieldResidence: string;
  fieldResidenceRural: string;
  fieldResidenceUrban: string;
  fieldResidenceSemiUrban: string;
  fieldResidenceAll: string;

  fieldLifeStage: string;
  fieldLifeStageStudent: string;
  fieldLifeStageStudentAgeRestricted: string;
  fieldLifeStageMaternal: string;
  fieldLifeStageMaternalAgeRestricted: string;
  fieldLifeStageEntrepreneur: string;
  fieldLifeStageEntrepreneurAgeRestricted: string;
  fieldLifeStageSenior: string;
  fieldLifeStageSeniorAgeRestricted: string;
  fieldLifeStageWidow: string;
  fieldLifeStageWidowAgeRestricted: string;
  fieldLifeStageGeneral: string;

  fieldBpl: string;
  fieldBplHelper: string;
  bplYesTitle: string;
  bplYesDesc: string;
  bplNoTitle: string;
  bplNoDesc: string;

  fieldDisability: string;
  fieldDisabilityHelper: string;
  disabilityYesTitle: string;
  disabilityYesDesc: string;
  disabilityNoTitle: string;
  disabilityNoDesc: string;

  fieldYes: string;
  fieldNo: string;
  validationErrorState: string;
  validationErrorAge: string;
  validationErrorIncome: string;
  validationCorrectFields: string;
  fieldOccupation: string;
  fieldEducation: string;
  optionalDetailsTitle: string;
  optionalDetailsSubtitle: string;
  ageResetNotice: string;

  // Wizard Submit & Actions
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
  filterCategoryAll: string;
  filterCategoryEducation: string;
  filterCategoryMaternity: string;
  filterCategoryBusiness: string;
  filterCategoryPension: string;
  filterScope: string;
  filterScopeAll: string;
  filterScopeCentral: string;
  filterScopeState: string;
  filterStateLabel: string;
  filterStateAll: string;
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
  paginationPrev: string;
  paginationNext: string;
  paginationPage: string;
  paginationOf: string;
  paginationShowing: string;
  paginationSchemes: string;

  // Scheme Detail Page (myScheme 4-Tab Architecture)
  detailTabBenefits: string;
  detailTabEligibility: string;
  detailTabDocuments: string;
  detailTabHowToApply: string;
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
  docCategoryCommon: string;
  docCategoryCommonDesc: string;
  docCategorySpecial: string;
  docCategorySpecialDesc: string;
  wizardBplAcronym: string;
  wizardDisabilityAcronym: string;
  wizardShgAcronym: string;
  detailDocReady: string;
  detailDocPending: string;
  detailApplicationProcessTitle: string;
  detailApplyStep1Title: string;
  detailApplyStep1Desc: string;
  detailApplyStep2Title: string;
  detailApplyStep2Desc: string;
  detailApplyStep3Title: string;
  detailApplyStep3Desc: string;
  detailCscCenterTitle: string;
  detailCscCenterDesc: string;
  offlineHelpTitle: string;
  offlineHelpSubtitle: string;
  offlinePoint1Title: string;
  offlinePoint1Role: string;
  offlinePoint1Action: string;
  offlinePoint2Title: string;
  offlinePoint2Role: string;
  offlinePoint2Action: string;
  offlinePoint3Title: string;
  offlinePoint3Role: string;
  offlinePoint3Action: string;
  detailDocsAllReady: string;
  detailDocsMissingTip: string;
  detailOfficialPortalCTA: string;
  detailOfficialWebsite: string;
  detailSchemeNotFound: string;
  detailSchemeNotFoundDesc: string;

  // Text-to-Speech (TTS) Audio Narration
  ttsListen: string;
  ttsSpeaking: string;
  ttsStop: string;
  ttsNotSupported: string;
  ttsPlayTooltip: string;
  ttsStopTooltip: string;

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
  bookmarksLoading: string;
  bookmarksShowingCount: string;
  bookmarksCategoryLabel: string;
  bookmarksAllChip: string;

  // About Page
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBadge: string;
  aboutMissionHeading: string;
  aboutVisionSubheading: string;
  aboutMissionP1: string;
  aboutMissionP2: string;
  aboutImpactQuote: string;
  aboutPillarsHeading: string;
  aboutPillarsSubheading: string;
  aboutDataSourcesHeading: string;
  aboutDataSourcesDesc: string;
  aboutDataTransparency: string;
  aboutDataSourceLabel: string;
  aboutTrademarksNote: string;
  aboutLegalDisclaimerHeading: string;
  aboutLegalDisclaimerP1: string;
  aboutLegalDisclaimerP2: string;
  aboutLegalDisclaimerP3: string;
  aboutOfficialPortalsHeading: string;
  aboutGatewaysSubheading: string;
  aboutVisitPortal: string;
  aboutCtaHeading: string;
  aboutCtaSubtitle: string;
  aboutCtaButton: string;
  aboutMadeWithLove: string;

  // Footer & Disclaimer
  footerDisclaimer: string;
  footerRights: string;
  footerGovtPortals: string;
  footerAbout: string;
  footerPrivacy: string;
  footerTerms: string;
  footerAccessibility: string;
  footerMadeWithLove: string;
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

    heroBadge: "Official Central & State Welfare Gateway",
    heroTitle: "Find Government Schemes For",
    heroHighlight: "Every Indian Woman",
    heroSubtitle: "Discover eligible schemes for education, maternity, business, and pension. 100% free and secure.",
    heroSearchPlaceholder: "Search scheme name (e.g. Sukanya, PMMVY, Mudra)...",
    heroSearchButton: "Search",
    heroVoiceTooltip: "Click to speak in Hindi or English",
    voiceListeningAlert: "Voice input listening... Speak scheme name or benefit.",
    heroStartWizard: "Find My Eligible Schemes",
    heroQuickSearch: "Popular Searches:",
    heroChipScholarship: "🎓 Scholarships",
    heroChipMaternity: "🤱 Maternity Aid",
    heroChipBusiness: "💼 Business Loans",
    heroChipPension: "👵 Pension",
    heroDirectWizardPrompt: "Or check instant eligibility:",
    ctaBannerTitle: "Ready to Discover Your Entitlements?",
    ctaBannerSubtitle: "Answer 3 simple questions to discover all direct welfare benefits designed for you.",
    badgeQuickTime: "⚡ 1-2 Min Discovery",
    badgeFreeService: "100% Free & Open",
    badgeNoLogin: "No Login Needed",

    statFreeAccess: "100% Free & Open",
    statFreeAccessSub: "Zero application or processing fee",
    statGovtSchemes: "Official Welfare Schemes",
    statGovtSchemesSub: "Direct from Central & State ministries",
    statNoAadhaar: "No Login or ID Needed",
    statNoAadhaarSub: "Check entitlement safely & privately",
    statTotalSchemes: "100+ Welfare Schemes",
    statTotalSchemesSub: "Across 28 States & Central Ministries",
    statDirectBenefits: "Direct DBT Cash Grants",
    statDirectBenefitsSub: "Scholarships, maternity aid & micro-loans",
    statFastMatching: "Instant Eligibility",
    statFastMatchingSub: "Accurate & verified government criteria",

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
    btnApply: "Apply on Official Portal",
    btnExplain: "Explain with AI",
    btnBookmark: "Bookmark",
    btnBookmarked: "Bookmarked",
    tagEligible: "✓ You Qualify",
    badgeEligible: "✓ You Qualify",
    badgeEligibleShort: "✓ Eligible",
    tagCentral: "Central Scheme",
    tagState: "State Scheme",

    // Wizard
    wizardTitle: "Find Government Schemes For You",
    wizardSubtitle: "Answer 3 simple questions to discover all direct cash grants, scholarships, and welfare benefits.",
    wizardPersonaLoaded: "Demo profile pre-loaded. Feel free to adjust any fields or proceed.",
    wizardStep1Title: "State & Age",
    wizardStep1Subtitle: "Your residence state and age",
    wizardStep2Title: "Category & Income",
    wizardStep2Subtitle: "Social category and family income tier",
    wizardStep3Title: "Life Stage & Status",
    wizardStep3Subtitle: "Current stage of life, ration card, and priority status",

    fieldState: "Select Your State / UT",
    fieldStatePlaceholder: "-- Choose your State --",
    fieldAge: "Your Age",
    fieldAgeHelper: "Schemes have specific age criteria (e.g. 0-10 for SSY, 19-45 for PMMVY)",
    fieldGender: "Gender",
    fieldGenderFemale: "Female (महिला)",
    fieldGenderTransgender: "Transgender (किन्नर / तृतीय लिंग)",
    fieldGenderAll: "All (सभी)",

    fieldCaste: "Social Category / Caste",
    casteGeneral: "General",
    casteObc: "OBC",
    casteSc: "SC",
    casteSt: "ST",
    casteMinorities: "Minority",

    fieldIncome: "Annual Household Income",
    fieldIncomeHelper: "Choose the income range closest to your family's annual earnings",
    incomeTierBpl: "BPL / Ration Card (₹0)",
    incomeTierBplDesc: "Antyodaya or BPL ration card / Zero income",
    incomeTierLow: "Low Income (< ₹1.5 Lakh / Yr)",
    incomeTierLowDesc: "Small farmer, daily wage, or artisan",
    incomeTierMid: "Middle Income (₹1.5L – ₹3L / Yr)",
    incomeTierMidDesc: "Modest household income",
    incomeTierHigh: "Above ₹3 Lakh / Yr",
    incomeTierHighDesc: "Salaried, business, or enterprise",
    ageTierChild: "Girl Child (0–17 Yrs)",
    ageTierStudent: "Young Woman / Student (18–25 Yrs)",
    ageTierAdult: "Adult Woman (26–59 Yrs)",
    ageTierSenior: "Senior Citizen (60+ Yrs)",
    ageNewbornLabel: "Newborn / Infant (< 1 year)",

    fieldResidence: "Residence Area",
    fieldResidenceRural: "Rural (गाँव / Village)",
    fieldResidenceUrban: "Urban (शहर / City)",
    fieldResidenceSemiUrban: "Town (कस्बा)",
    fieldResidenceAll: "Any / All Area",

    fieldLifeStage: "Current Stage of Life",
    fieldLifeStageStudent: "Student / Higher Education",
    fieldLifeStageStudentAgeRestricted: "Requires age ≤ 35",
    fieldLifeStageMaternal: "Pregnant / Expecting Mother",
    fieldLifeStageMaternalAgeRestricted: "Requires age 18–50",
    fieldLifeStageEntrepreneur: "Self-Employed / SHG Member",
    fieldLifeStageEntrepreneurAgeRestricted: "Requires age 18+",
    fieldLifeStageSenior: "Senior Citizen (60+)",
    fieldLifeStageSeniorAgeRestricted: "Requires age 60+",
    fieldLifeStageWidow: "Widow / Single Mother",
    fieldLifeStageWidowAgeRestricted: "Requires age 18+",
    fieldLifeStageGeneral: "General Citizen",

    fieldBpl: "Do you have a BPL or Antyodaya Ration Card?",
    fieldBplHelper: "Direct priority welfare benefits for subsidized food, housing, and social grants",
    bplYesTitle: "Yes, have Ration Card",
    bplYesDesc: "Antyodaya or BPL card holder",
    bplNoTitle: "No, Non-BPL / General",
    bplNoDesc: "No BPL ration card",

    fieldDisability: "Do you have a recognized Disability (PwD)?",
    fieldDisabilityHelper: "Special pensions and assistive equipment grants are available for 40%+ disability",
    disabilityYesTitle: "Yes, PwD Certificate (40%+)",
    disabilityYesDesc: "Eligible for disability grants & aids",
    disabilityNoTitle: "No / Not Applicable",
    disabilityNoDesc: "No recognized disability",

    fieldYes: "Yes (हाँ)",
    fieldNo: "No (नहीं)",
    validationErrorState: "Please select your state or UT of residence.",
    validationErrorAge: "Please enter a valid age between 0 and 110 years.",
    validationErrorIncome: "Please select your family income tier.",
    validationCorrectFields: "Please correct the highlighted fields before proceeding.",
    fieldOccupation: "Current Occupation",
    fieldEducation: "Highest Education Level",
    optionalDetailsTitle: "Additional Profile Details (Optional)",
    optionalDetailsSubtitle: "Helps discover tailored student scholarships & self-employment schemes",
    ageResetNotice: "Options automatically adjusted to match your age.",

    wizardEdit: "Edit",
    wizardSubmitBtn: "Find My Schemes",
    wizardMatchingLoading: "Finding all welfare schemes you qualify for...",

    // Results Page
    resultsTitle: "Government Schemes You Qualify For",
    resultsSubtitle: "Directly matched based on your age, state, and life stage",
    resultsFoundCount: "Eligible Schemes Found",
    resultsExecutionTime: "Matched in",
    resultsRefineProfile: "Change Profile",
    filterAllCategories: "All Schemes",
    filterCategory: "Category",
    filterCategoryAll: "🌸 All Schemes",
    filterCategoryEducation: "🎓 Education",
    filterCategoryMaternity: "🤱 Maternity & Nutrition",
    filterCategoryBusiness: "💼 Business & SHG",
    filterCategoryPension: "👵 Pension & Support",
    filterScope: "Scope",
    filterScopeAll: "All",
    filterScopeCentral: "Central",
    filterScopeState: "State Only",
    filterStateLabel: "State / UT",
    filterStateAll: "All States & UTs",
    filterLifeStage: "Stage",
    filterLifeStageAll: "All",
    sortLabel: "Sort",
    sortHighestMatch: "Best Fit",
    sortNameAsc: "Scheme Name (A-Z)",
    sortMinistryAsc: "Ministry (A-Z)",
    searchInResults: "Search within these schemes...",
    cardMatchScore: "Eligible",
    cardWhyYouQualify: "Why you qualify:",
    cardKeyBenefits: "What you get:",
    cardViewDetails: "View Details & Apply",
    cardApplyOfficial: "Apply on Official Portal",
    emptyResultsTitle: "No Schemes Found for Selected Filters",
    emptyResultsDesc: "No welfare schemes currently match your active filter criteria. Try clearing search keywords or widening your filters.",
    emptyResetFilters: "Show All Schemes",
    emptyBackToWizard: "Adjust Profile",
    resultsProfileSummary: "Evaluated Profile",
    toastBookmarkSaved: "Scheme saved to your bookmarks!",
    toastBookmarkRemoved: "Scheme removed from bookmarks",
    paginationPrev: "Previous",
    paginationNext: "Next",
    paginationPage: "Page",
    paginationOf: "of",
    paginationShowing: "Showing",
    paginationSchemes: "schemes",

    // Scheme Detail Page (myScheme 4-Tab Architecture)
    detailTabBenefits: "Benefits (फायदे)",
    detailTabEligibility: "Eligibility (पात्रता)",
    detailTabDocuments: "Documents (कागजात)",
    detailTabHowToApply: "How to Apply (आवेदन)",
    detailBackToResults: "Back to Schemes",
    detailNodalMinistry: "Nodal Ministry",
    detailNodalDepartment: "Department",
    detailKeyAttributes: "Eligibility Snapshot",
    detailAgeLimit: "Age Limit",
    detailGender: "Gender",
    detailCaste: "Caste / Category",
    detailIncomeLimit: "Income Limit",
    detailNoIncomeLimit: "No Maximum Income Limit",
    detailResidence: "Residence Scope",
    detailBplPriority: "BPL Priority",
    detailDisabilityPriority: "Disability Priority",
    detailLifeStageTags: "Life Stages",
    detailBenefitsTitle: "Financial & Welfare Benefits",
    detailEligibilityTitle: "Who is Eligible",
    detailDocumentsTitle: "Required Documents Checklist",
    detailDocsChecklistHelp: "Mark the documents you have ready before visiting CSC or Anganwadi:",
    docCategoryCommon: "Common Identity & Bank Documents",
    docCategoryCommonDesc: "Standard documents you likely already have at home:",
    docCategorySpecial: "Special Government Certificates",
    docCategorySpecialDesc: "Issued by local Tehsil, CSC center, or Health Department:",
    wizardBplAcronym: "BPL = Below Poverty Line (Ration card holder families)",
    wizardDisabilityAcronym: "PwD = Person with Disability (40%+ disability certificate / UDID card)",
    wizardShgAcronym: "SHG = Self Help Group (Women's livelihood group / Sakhi Mandal)",
    detailDocReady: "Ready",
    detailDocPending: "Pending",
    detailApplicationProcessTitle: "How and Where to Apply",
    detailApplyStep1Title: "1. Check Eligibility & Prepare Documents",
    detailApplyStep1Desc: "Verify your profile against eligibility criteria and keep checked documents ready.",
    detailApplyStep2Title: "2. Submit Online or Visit Nearest Citizen Center",
    detailApplyStep2Desc: "Apply on the official government portal, or visit a nearby CSC / Anganwadi center.",
    detailApplyStep3Title: "3. Track Application & Receive DBT Benefits",
    detailApplyStep3Desc: "Save your application acknowledgement number to track status and receive funds directly in your bank account.",
    detailCscCenterTitle: "💡 Offline Assistance & Form Filing Support",
    detailCscCenterDesc: "If you need help filling out online forms or scanning documents, visit your nearest Common Service Center (CSC), Anganwadi Kendra, or Gram Panchayat office.",
    offlineHelpTitle: "Where to Apply Locally? (Offline Citizen Help Points)",
    offlineHelpSubtitle: "If you cannot fill out online forms or lack internet access, visit these 3 trusted local touchpoints in your village or ward:",
    offlinePoint1Title: "1. Anganwadi Center / ASHA Worker",
    offlinePoint1Role: "Maternity (PMMVY), child nutrition, girl education & health schemes",
    offlinePoint1Action: "Meet your local Anganwadi worker or ASHA didi for physical form filling, MCP card verification, and offline document submission.",
    offlinePoint2Title: "2. Gram Panchayat Bhawan / Secretary",
    offlinePoint2Role: "Widow pension (IGNWPS), old-age pension, PMAY rural housing & MGNREGA",
    offlinePoint2Action: "Visit the Panchayat office to verify local residence/income eligibility and submit verified application forms through the village secretary.",
    offlinePoint3Title: "3. Common Service Center (CSC / e-Mitra)",
    offlinePoint3Role: "All central & state online portal submissions, income/caste certificates & biometric e-KYC",
    offlinePoint3Action: "Pay nominal government rates (₹20-50) to get documents scanned, Aadhaar authenticated, forms submitted, and printed acknowledgements.",
    detailDocsAllReady: "All Documents Ready!",
    detailDocsMissingTip: "Missing some documents? You can apply for income, caste, and domicile certificates at your nearest Tehsil office or CSC center.",
    detailOfficialPortalCTA: "Apply on Official Government Portal",
    detailOfficialWebsite: "Official Ministry Website",
    detailSchemeNotFound: "Scheme Not Found",
    detailSchemeNotFoundDesc: "The requested welfare scheme could not be found in our database.",

    // Text-to-Speech (TTS) Audio Narration
    ttsListen: "Listen",
    ttsSpeaking: "Speaking...",
    ttsStop: "Stop",
    ttsNotSupported: "Audio narration is not supported on this browser.",
    ttsPlayTooltip: "Listen to scheme details in audio",
    ttsStopTooltip: "Stop audio narration",

    // AI Explanation Component
    aiExplainTitle: "Plain-Language Summary",
    aiExplainSubtitle: "Easy-to-understand explanation of benefits and required steps",
    aiExplainLangToggle: "Language",
    aiExplainTriggerBtn: "Explain in Simple Words",
    aiExplainLoadingTitle: "Generating simple summary...",
    aiExplainLoadingDesc: "Translating official guidelines into clear, simple language.",
    aiExplainSummaryTitle: "Quick Summary (योजना का सार)",
    aiExplainBenefitsTitle: "What You Will Receive",
    aiExplainDocsTitle: "Documents You Need",
    aiExplainNextStepsTitle: "How to Proceed",
    aiExplainDisclaimerTitle: "Official Notice",
    aiExplainGeminiBadge: "Plain-Language Guidance",
    aiExplainFallbackBadge: "Official Guidelines",

    // Bookmarks Page & Dashboard
    bookmarksTitle: "My Saved Schemes",
    bookmarksSubtitle: "Quick access to schemes you have shortlisted",
    bookmarksAuthPromptTitle: "Sign In to Access Saved Schemes",
    bookmarksAuthPromptDesc: "Sign in to save and sync your eligible welfare benefits across all devices.",
    bookmarksQuickSignIn: "Quick Sign In:",
    bookmarksCustomSignIn: "Or Sign In with Email:",
    bookmarksSignInBtn: "Sign In & View Saved",
    bookmarksRemoveBtn: "Remove",
    bookmarksProfileCardTitle: "Saved Profile",
    bookmarksProfileCardDesc: "Used for personalized entitlement discovery",
    bookmarksFindWithProfile: "Find Schemes with My Profile",
    bookmarksRefineProfile: "Update Profile",
    bookmarksEmptyTitle: "No Saved Schemes Yet",
    bookmarksEmptyDesc: "Explore government welfare schemes and bookmark them to view here.",
    bookmarksExploreBtn: "Find My Schemes",
    bookmarksSearchPlaceholder: "Filter saved schemes...",
    bookmarksCountBadge: "Saved Schemes",
    bookmarksLoading: "Loading your saved bookmarks...",
    bookmarksShowingCount: "saved welfare scheme",
    bookmarksCategoryLabel: "Category:",
    bookmarksAllChip: "All",

    // About Page
    aboutTitle: "About Yojana Dvar (योजना द्वार)",
    aboutSubtitle: "Empowering Indian women with easy, accessible, and transparent welfare entitlement discovery.",
    aboutBadge: "Open-Source Civic Tech • Built for India",
    aboutMissionHeading: "Project Mission & Vision",
    aboutVisionSubheading: "Vision & Alignment",
    aboutMissionP1: "India maintains one of the world's most extensive social welfare safety nets. However, complex guidelines and administrative jargon prevent millions of eligible beneficiaries from accessing their entitlements.",
    aboutMissionP2: "Yojana Dvar was created to bridge this discovery gap, empowering citizens with simple demographic inputs and plain-language guidance in English and हिंदी.",
    aboutImpactQuote: "“Every woman in India possesses the constitutional and social right to easily know, understand, and claim the welfare entitlements created for her upliftment — without bureaucratic intermediaries.”",
    aboutPillarsHeading: "Core Principles",
    aboutPillarsSubheading: "Technology & Philosophy",
    aboutDataSourcesHeading: "Data Sources & Public Attribution",
    aboutDataSourcesDesc: "Our catalog is synthesized and cross-verified against official Indian government public domains and open data repositories:",
    aboutDataTransparency: "Data Transparency",
    aboutDataSourceLabel: "Source:",
    aboutTrademarksNote: "All scheme titles, eligibility rules, nodal guidelines, and portal trademarks belong to their respective nodal ministries of the Government of India and State Governments.",
    aboutLegalDisclaimerHeading: "Legal Disclaimer",
    aboutLegalDisclaimerP1: "Important Notice: Yojana Dvar is an independent civic technology platform developed for public informational purposes. It is NOT a government agency.",
    aboutLegalDisclaimerP2: "Yojana Dvar does NOT collect fees, process transactions, or disburse benefits. All benefits are disbursed solely by competent government authorities.",
    aboutLegalDisclaimerP3: "Citizens must submit applications and verify guidelines on designated official portals (*.gov.in and *.nic.in).",
    aboutOfficialPortalsHeading: "Recognized Official Portals",
    aboutGatewaysSubheading: "Nodal Gateways",
    aboutVisitPortal: "Visit Official Portal",
    aboutCtaHeading: "Ready to Discover Your Entitlements?",
    aboutCtaSubtitle: "Input your state, age, and life stage to get an instant matched list of central and state welfare entitlements with AI plain-language explanations.",
    aboutCtaButton: "Find My Schemes",
    aboutMadeWithLove: "Made with ❤️ for women entitlement empowerment across India",

    footerDisclaimer: "Disclaimer: Yojana Dvar is an informational gateway and not a government agency. Always verify guidelines on official portals.",
    footerRights: "© 2026 Yojana Dvar. Open-source civic tech built for women welfare empowerment.",
    footerGovtPortals: "Official Portals: myScheme.gov.in • Ministry of Women & Child Development • Digital India",
    footerAbout: "About Yojana Dvar",
    footerPrivacy: "Data Privacy",
    footerTerms: "Terms of Use",
    footerAccessibility: "Web Accessibility",
    footerMadeWithLove: "Made with ❤️ for women empowerment across India"
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

    heroBadge: "केंद्र व राज्य सरकार की आधिकारिक योजनाएं",
    heroTitle: "हर भारतीय महिला को मिले",
    heroHighlight: "उसका सरकारी अधिकार",
    heroSubtitle: "शिक्षा, मातृत्व, स्वरोजगार और पेंशन की सरकारी योजनाएं खोजें। 100% निःशुल्क और सुरक्षित।",
    heroSearchPlaceholder: "योजना का नाम खोजें (जैसे सुकन्या, मातृत्व, मुद्रा)...",
    heroSearchButton: "खोजें",
    heroVoiceTooltip: "हिंदी या अंग्रेजी में बोलने के लिए क्लिक करें",
    voiceListeningAlert: "आवाज पहचानी जा रही है... योजना का नाम या लाभ बोलें।",
    heroStartWizard: "अपनी योजनाएं खोजें",
    heroQuickSearch: "मुख्य योजनाएं:",
    heroChipScholarship: "🎓 छात्रवृत्ति",
    heroChipMaternity: "🤱 मातृत्व सहायता",
    heroChipBusiness: "💼 व्यवसाय व ऋण",
    heroChipPension: "👵 पेंशन",
    heroDirectWizardPrompt: "या 3 प्रश्नों में पात्रता निकालें:",
    ctaBannerTitle: "अपनी पात्रता जांचने के लिए तैयार हैं?",
    ctaBannerSubtitle: "केवल 3 सरल प्रश्नों के उत्तर दें और 1 मिनट में अपनी पात्र योजनाओं की सूची पाएं।",
    badgeQuickTime: "⚡ 1-2 मिनट का समय",
    badgeFreeService: "100% नि:शुल्क सेवा",
    badgeNoLogin: "लॉगिन अनिवार्य नहीं",

    statFreeAccess: "100% नि:शुल्क सेवा",
    statFreeAccessSub: "कोई आवेदन शुल्क या बिचौलिया नहीं",
    statGovtSchemes: "सत्यापित सरकारी योजनाएं",
    statGovtSchemesSub: "केंद्र व राज्य मंत्रालयों से सीधे संकलित",
    statNoAadhaar: "कोई आधार या लॉगिन अनिवार्य नहीं",
    statNoAadhaarSub: "सुरक्षित और गोपनीय पात्रता जांच",
    statTotalSchemes: "100+ कल्याणकारी योजनाएं",
    statTotalSchemesSub: "28 राज्यों और केंद्रीय मंत्रालयों से",
    statDirectBenefits: "प्रत्यक्ष डीबीटी बैंक अनुदान",
    statDirectBenefitsSub: "छात्रवृत्ति, मातृत्व सहायता और सूक्ष्म ऋण",
    statFastMatching: "तुरंत पात्रता मिलान",
    statFastMatchingSub: "सरल व सटीक पात्रता गणना",

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
    stageSeniorDesc: "मासिक पेंशन, आयुष्मान भारत मुफ्त इलाज और सुरक्षित आश्रय।",

    btnExploreAll: "सभी योजनाएं देखें",
    btnBack: "पीछे जाएं",
    btnNext: "आगे बढ़ें",
    btnApply: "आधिकारिक पोर्टल पर आवेदन करें",
    btnExplain: "सरल भाषा में समझें",
    btnBookmark: "सहेजें",
    btnBookmarked: "सहेजा गया",
    tagEligible: "✓ आप पात्र हैं",
    badgeEligible: "✓ आप पात्र हैं",
    badgeEligibleShort: "✓ पात्र",
    tagCentral: "केंद्रीय योजना",
    tagState: "राज्य योजना",

    // Wizard
    wizardTitle: "अपनी सरकारी योजनाएं खोजें",
    wizardSubtitle: "केवल 3 सरल प्रश्नों के उत्तर दें और अपने सभी सरकारी लाभ, छात्रवृत्ति व अनुदान तुरंत पाएं।",
    wizardPersonaLoaded: "डेमो प्रोफाइल लोड हो गई है। आप इसे अपनी आवश्यकता अनुसार बदल सकते हैं।",
    wizardStep1Title: "राज्य व आयु",
    wizardStep1Subtitle: "आपका निवास राज्य और आयु",
    wizardStep2Title: "वर्ग व आय",
    wizardStep2Subtitle: "सामाजिक श्रेणी और पारिवारिक आय",
    wizardStep3Title: "आपकी स्थिति व राशन कार्ड",
    wizardStep3Subtitle: "जीवन चरण, बीपीएल राशन कार्ड और प्राथमिकता",

    fieldState: "अपना राज्य / केंद्रशासित प्रदेश चुनें",
    fieldStatePlaceholder: "-- अपना राज्य चुनें --",
    fieldAge: "आपकी आयु (वर्ष में)",
    fieldAgeHelper: "योजनाओं में विशिष्ट आयु सीमा होती है (जैसे सुकन्या के लिए 0-10, PMMVY के लिए 19-45 वर्ष)",
    fieldGender: "लिंग",
    fieldGenderFemale: "महिला (Female)",
    fieldGenderTransgender: "किन्नर / तृतीय लिंग (Transgender)",
    fieldGenderAll: "सभी (All)",

    fieldCaste: "सामाजिक श्रेणी / जाति",
    casteGeneral: "सामान्य (General)",
    casteObc: "ओबीसी (OBC)",
    casteSc: "अनुसूचित जाति (SC)",
    casteSt: "अनुसूचित जनजाति (ST)",
    casteMinorities: "अल्पसंख्यक (Minority)",

    fieldIncome: "वार्षिक पारिवारिक आय",
    fieldIncomeHelper: "अपने परिवार की कुल अनुमानित वार्षिक कमाई चुनें",
    incomeTierBpl: "BPL / राशन कार्ड (शून्य आय)",
    incomeTierBplDesc: "अंत्योदय या बीपीएल राशन कार्ड धारक",
    incomeTierLow: "कम आय (₹1.5 लाख से कम)",
    incomeTierLowDesc: "छोटे किसान, दैनिक मजदूर या कारीगर",
    incomeTierMid: "मध्यम आय (₹1.5 लाख से ₹3 लाख)",
    incomeTierMidDesc: "सामान्य पारिवारिक आय",
    incomeTierHigh: "वार्षिक ₹3 लाख से अधिक",
    incomeTierHighDesc: "वेतनभोगी या स्थापित व्यवसाय",
    ageTierChild: "बालिका (0–17 वर्ष)",
    ageTierStudent: "युवती / छात्रा (18–25 वर्ष)",
    ageTierAdult: "वयस्क महिला (26–59 वर्ष)",
    ageTierSenior: "वरिष्ठ नागरिक (60+ वर्ष)",
    ageNewbornLabel: "नवजात शिशु (आयु < 1 वर्ष)",

    fieldResidence: "निवास क्षेत्र",
    fieldResidenceRural: "ग्रामीण (गाँव / Rural)",
    fieldResidenceUrban: "शहरी (शहर / Urban)",
    fieldResidenceSemiUrban: "कस्बा (Town)",
    fieldResidenceAll: "कोई भी क्षेत्र (All)",

    fieldLifeStage: "वर्तमान परिस्थिति",
    fieldLifeStageStudent: "छात्रा / उच्च शिक्षा (Student)",
    fieldLifeStageStudentAgeRestricted: "अधिकतम 35 वर्ष तक",
    fieldLifeStageMaternal: "गर्भवती / धात्री माता (Maternal)",
    fieldLifeStageMaternalAgeRestricted: "18–50 वर्ष आवश्यक",
    fieldLifeStageEntrepreneur: "महिला उद्यमी / SHG सदस्य (Business)",
    fieldLifeStageEntrepreneurAgeRestricted: "18+ वर्ष आवश्यक",
    fieldLifeStageSenior: "वरिष्ठ नागरिक (Senior 60+)",
    fieldLifeStageSeniorAgeRestricted: "60+ वर्ष आवश्यक",
    fieldLifeStageWidow: "विधवा / एकल महिला (Widow)",
    fieldLifeStageWidowAgeRestricted: "18+ वर्ष आवश्यक",
    fieldLifeStageGeneral: "सामान्य नागरिक (General)",

    fieldBpl: "क्या आपके पास बीपीएल (BPL) या अंत्योदय राशन कार्ड है?",
    fieldBplHelper: "बीपीएल परिवारों को राशन, आवास और विशेष कल्याण योजनाओं में सीधा लाभ मिलता है",
    bplYesTitle: "हाँ, राशन कार्ड है",
    bplYesDesc: "BPL या अंत्योदय राशन कार्ड धारक",
    bplNoTitle: "नहीं, सामान्य श्रेणी",
    bplNoDesc: "बीपीएल राशन कार्ड नहीं है",

    fieldDisability: "क्या आप दिव्यांग (PwD) श्रेणी में आते हैं?",
    fieldDisabilityHelper: "40% या अधिक दिव्यांगता प्रमाण पत्र पर विशेष सहायता पेंशन व उपकरण उपलब्ध हैं",
    disabilityYesTitle: "हाँ, दिव्यांगता प्रमाण पत्र है",
    disabilityYesDesc: "40% या अधिक दिव्यांगता (PwD)",
    disabilityNoTitle: "नहीं / लागू नहीं",
    disabilityNoDesc: "सामान्य स्वास्थ्य स्थिति",

    fieldYes: "हाँ (Yes)",
    fieldNo: "नहीं (No)",
    validationErrorState: "कृपया अपना निवास राज्य या केंद्र शासित प्रदेश चुनें।",
    validationErrorAge: "कृपया 0 से 110 वर्ष के बीच एक मान्य आयु दर्ज करें।",
    validationErrorIncome: "कृपया अपनी पारिवारिक आय श्रेणी चुनें।",
    validationCorrectFields: "कृपया आगे बढ़ने से पहले चिह्नित फ़ील्ड को ठीक करें।",
    fieldOccupation: "वर्तमान व्यवसाय",
    fieldEducation: "उच्चतम शिक्षा स्तर",
    optionalDetailsTitle: "अतिरिक्त विवरण (वैकल्पिक)",
    optionalDetailsSubtitle: "छात्रा व स्वरोजगार योजनाओं के सटीक मिलान के लिए",
    ageResetNotice: "आपकी आयु के अनुसार विकल्प स्वतः समायोजित किए गए हैं।",

    wizardEdit: "बदलें",
    wizardSubmitBtn: "मेरी पात्र योजनाएं देखें",
    wizardMatchingLoading: "आपकी पात्र योजनाओं की सूची तैयार की जा रही है...",

    // Results Page
    resultsTitle: "आपकी पात्र सरकारी योजनाएं",
    resultsSubtitle: "आपकी आयु, राज्य और स्थिति के आधार पर सीधे मेल खाने वाली योजनाएं",
    resultsFoundCount: "पात्र योजनाएं मिलीं",
    resultsExecutionTime: "गणना समय:",
    resultsRefineProfile: "प्रोफ़ाइल बदलें",
    filterAllCategories: "सभी योजनाएं",
    filterCategory: "श्रेणी",
    filterCategoryAll: "🌸 सभी योजनाएं",
    filterCategoryEducation: "🎓 शिक्षा (Education)",
    filterCategoryMaternity: "🤱 मातृत्व व पोषण (Maternity)",
    filterCategoryBusiness: "💼 व्यवसाय व SHG (Business)",
    filterCategoryPension: "👵 पेंशन व सहायता (Pension)",
    filterScope: "दायरा",
    filterScopeAll: "सभी",
    filterScopeCentral: "केंद्रीय",
    filterScopeState: "केवल राज्य",
    filterStateLabel: "राज्य / UT",
    filterStateAll: "सभी राज्य व UT",
    filterLifeStage: "चरण",
    filterLifeStageAll: "सभी",
    sortLabel: "क्रम",
    sortHighestMatch: "सर्वश्रेष्ठ मेल",
    sortNameAsc: "योजना का नाम (A-Z)",
    sortMinistryAsc: "मंत्रालय (A-Z)",
    searchInResults: "इन योजनाओं में खोजें...",
    cardMatchScore: "पात्र",
    cardWhyYouQualify: "आप क्यों पात्र हैं:",
    cardKeyBenefits: "आपको क्या मिलेगा:",
    cardViewDetails: "विवरण देखें व आवेदन करें",
    cardApplyOfficial: "आधिकारिक पोर्टल पर आवेदन करें",
    emptyResultsTitle: "चयनित फ़िल्टर के लिए कोई योजना नहीं मिली",
    emptyResultsDesc: "वर्तमान में आपकी फ़िल्टर शर्तों से कोई योजना मेल नहीं खाती। कृपया फ़िल्टर रीसेट करें या प्रोफ़ाइल बदलें।",
    emptyResetFilters: "सभी योजनाएं देखें",
    emptyBackToWizard: "प्रोफ़ाइल बदलें",
    resultsProfileSummary: "आपकी दर्ज जानकारी",
    toastBookmarkSaved: "योजना आपकी सहेजी गई सूची में जोड़ी गई!",
    toastBookmarkRemoved: "योजना सहेजी गई सूची से हटाई गई",
    paginationPrev: "पिछला",
    paginationNext: "अगला",
    paginationPage: "पृष्ठ",
    paginationOf: "का",
    paginationShowing: "दिखाए जा रहे हैं",
    paginationSchemes: "योजनाएं",

    // Scheme Detail Page (myScheme 4-Tab Architecture)
    detailTabBenefits: "क्या मिलेगा (Benefits)",
    detailTabEligibility: "कौन पात्र है (Eligibility)",
    detailTabDocuments: "जरूरी कागजात (Documents)",
    detailTabHowToApply: "आवेदन कैसे करें (How to Apply)",
    detailBackToResults: "योजनाओं पर वापस जाएं",
    detailNodalMinistry: "मंत्रालय",
    detailNodalDepartment: "विभाग",
    detailKeyAttributes: "पात्रता संक्षिप्त विवरण",
    detailAgeLimit: "आयु सीमा",
    detailGender: "लिंग",
    detailCaste: "जाति / श्रेणी",
    detailIncomeLimit: "आय सीमा",
    detailNoIncomeLimit: "कोई अधिकतम आय सीमा नहीं",
    detailResidence: "निवास क्षेत्र",
    detailBplPriority: "बीपीएल प्राथमिकता",
    detailDisabilityPriority: "दिव्यांगता प्राथमिकता",
    detailLifeStageTags: "जीवन चरण",
    detailBenefitsTitle: "क्या मिलेगा (वित्तीय व कल्याणकारी लाभ)",
    detailEligibilityTitle: "कौन पात्र है (पात्रता शर्तें)",
    detailDocumentsTitle: "जरूरी कागजात की चेकलिस्ट",
    detailDocsChecklistHelp: "आवेदन करने से पहले अपने उपलब्ध दस्तावेजों पर सही का निशान लगाएं:",
    docCategoryCommon: "सामान्य पहचान व बैंक दस्तावेज (Common Documents)",
    docCategoryCommonDesc: "यह सामान्य दस्तावेज जो आमतौर पर आपके पास घर पर पहले से उपलब्ध होते हैं:",
    docCategorySpecial: "विशेष सरकारी प्रमाण पत्र (Special Certificates)",
    docCategorySpecialDesc: "यह प्रमाण पत्र तहसील, सीएससी केंद्र या अस्पताल/संस्थान द्वारा जारी किए जाते हैं:",
    wizardBplAcronym: "BPL = गरीबी रेखा से नीचे (बीपीएल / अंत्योदय राशन कार्ड धारक परिवार)",
    wizardDisabilityAcronym: "PwD = दिव्यांगजन (40% या अधिक दिव्यांगता प्रमाण पत्र / UDID कार्ड धारक)",
    wizardShgAcronym: "SHG = स्वयं सहायता समूह (महिला सखी मंडल / आजीविका समूह सदस्य)",
    detailDocReady: "तैयार",
    detailDocPending: "शेष",
    detailApplicationProcessTitle: "आवेदन कैसे करें (चरणबद्ध प्रक्रिया)",
    detailApplyStep1Title: "1. पात्रता जांचें और कागजात तैयार रखें",
    detailApplyStep1Desc: "जांचें कि आप सभी पात्रता शर्तों को पूरा करते हैं और जरूरी पहचान/आय दस्तावेज तैयार हैं।",
    detailApplyStep2Title: "2. ऑनलाइन आवेदन करें या सीएससी केंद्र जाएं",
    detailApplyStep2Desc: "सीधे सरकारी पोर्टल पर फॉर्म भरें या नजदीकी जन सेवा केंद्र (CSC) / आंगनवाड़ी केंद्र जाएं।",
    detailApplyStep3Title: "3. आवेदन रसीद संभालें व लाभ प्राप्त करें",
    detailApplyStep3Desc: "आवेदन संख्या सुरक्षित रखें ताकि स्थिति ट्रैक कर सकें और डीबीटी (DBT) लाभ सीधे बैंक खाते में पहुंचे।",
    detailCscCenterTitle: "💡 नजदीकी सहायता व ऑफलाइन आवेदन केंद्र",
    detailCscCenterDesc: "यदि ऑनलाइन आवेदन या दस्तावेज अपलोड में कठिनाई हो, तो अपने नजदीकी जन सेवा केंद्र (CSC), आंगनवाड़ी केंद्र या ग्राम पंचायत कार्यालय में कागजात ले जाएं।",
    offlineHelpTitle: "गांव या कस्बे में कहां से आवेदन करें? (ऑफ़लाइन सहायता केंद्र)",
    offlineHelpSubtitle: "यदि ऑनलाइन फॉर्म भरने या इंटरनेट चलाने में परेशानी हो, तो अपने नजदीकी इन 3 स्थानों पर संपर्क करें:",
    offlinePoint1Title: "1. आंगनवाड़ी केंद्र / आशा दीदी (Anganwadi / ASHA)",
    offlinePoint1Role: "मातृत्व पोषण (PMMVY), कन्या जन्म, किशोरी व स्वास्थ्य योजनाओं हेतु",
    offlinePoint1Action: "आंगनवाड़ी सेविका या आशा दीदी से मिलकर कागजी फॉर्म भरें, एमसीपी (MCP) कार्ड सत्यापित कराएं और ऑफलाइन जमा करें।",
    offlinePoint2Title: "2. ग्राम पंचायत भवन / पंचायत सचिव (Gram Panchayat)",
    offlinePoint2Role: "विधवा पेंशन (IGNWPS), वृद्धावस्था पेंशन, आवास व मनरेगा कार्ड हेतु",
    offlinePoint2Action: "पंचायत कार्यालय में सचिव या ग्राम प्रधान/मुखिया से मिलकर पात्रता प्रमाणन व ऑफलाइन फॉर्म अग्रेषित कराएं।",
    offlinePoint3Title: "3. जन सेवा केंद्र / CSC / ई-मित्र (Common Service Center)",
    offlinePoint3Role: "सभी ऑनलाइन पोर्टल फॉर्म, आय/जाति/मूल निवास प्रमाण पत्र व बायोमेट्रिक KYC",
    offlinePoint3Action: "मात्र ₹20 से ₹50 के सरकारी शुल्क पर दस्तावेज स्कैन कराएं, फॉर्म भरवाएं और पक्की रसीद (Acknowledgement) प्राप्त करें।",
    detailDocsAllReady: "सभी जरूरी कागजात तैयार हैं!",
    detailDocsMissingTip: "कागजात पूरे नहीं हैं? आप आय, जाति व निवास प्रमाण पत्र नजदीकी तहसील या जन सेवा केंद्र से बनवा सकते हैं।",
    detailOfficialPortalCTA: "आधिकारिक पोर्टल पर ऑनलाइन आवेदन करें",
    detailOfficialWebsite: "मंत्रालय की आधिकारिक वेबसाइट",
    detailSchemeNotFound: "योजना नहीं मिली",
    detailSchemeNotFoundDesc: "अनुरोधित सरकारी योजना कैटलॉग में नहीं मिली।",

    // Text-to-Speech (TTS) Audio Narration
    ttsListen: "सुनें",
    ttsSpeaking: "सुनाया जा रहा है...",
    ttsStop: "रोकें",
    ttsNotSupported: "आपके ब्राउज़र में वॉइस सुविधा उपलब्ध नहीं है।",
    ttsPlayTooltip: "योजना के मुख्य लाभ और विवरण बोलकर सुनें",
    ttsStopTooltip: "आवाज बंद करें",

    // AI Explanation Component
    aiExplainTitle: "योजना का सरल सार",
    aiExplainSubtitle: "कठिन सरकारी नियमों का सरल व आसान भाषा में स्पष्टीकरण",
    aiExplainLangToggle: "भाषा",
    aiExplainTriggerBtn: "सरल भाषा में समझें",
    aiExplainLoadingTitle: "सरल भाषा में सारांश तैयार हो रहा है...",
    aiExplainLoadingDesc: "आपकी आयु और स्थिति के अनुसार मुख्य लाभ निकाले जा रहे हैं।",
    aiExplainSummaryTitle: "इस योजना का सार (Quick Summary)",
    aiExplainBenefitsTitle: "आपको क्या-क्या मिलेगा",
    aiExplainDocsTitle: "आपके लिए जरूरी कागजात",
    aiExplainNextStepsTitle: "आगे क्या करना है",
    aiExplainDisclaimerTitle: "सरकारी सलाह सूचना",
    aiExplainGeminiBadge: "सरल भाषा मार्गदर्शन",
    aiExplainFallbackBadge: "आधिकारिक सरकारी नियम",

    // Bookmarks Page & Dashboard
    bookmarksTitle: "मेरी सहेजी गई योजनाएं",
    bookmarksSubtitle: "अपनी पसंदीदा योजनाओं की सूची देखें",
    bookmarksAuthPromptTitle: "अपनी सहेजी गई योजनाएं देखने के लिए साइन इन करें",
    bookmarksAuthPromptDesc: "सभी डिवाइसों पर अपनी पात्र योजनाओं को सुरक्षित रखने के लिए साइन इन करें।",
    bookmarksQuickSignIn: "त्वरित साइन इन:",
    bookmarksCustomSignIn: "या ईमेल द्वारा लॉगिन करें:",
    bookmarksSignInBtn: "लॉगिन करें और सहेजी गई योजनाएं देखें",
    bookmarksRemoveBtn: "हटाएं",
    bookmarksProfileCardTitle: "सहेजी गई प्रोफ़ाइल",
    bookmarksProfileCardDesc: "पात्रता की व्यक्तिगत गणना हेतु उपयोग की जाने वाली प्रोफ़ाइल",
    bookmarksFindWithProfile: "मेरी प्रोफ़ाइल से योजनाएं खोजें",
    bookmarksRefineProfile: "प्रोफ़ाइल अपडेट करें",
    bookmarksEmptyTitle: "अभी तक कोई योजना सहेजी नहीं गई है",
    bookmarksEmptyDesc: "सरकारी योजनाओं को खोजें और अपनी पसंद की योजनाओं को यहाँ सहेजें।",
    bookmarksExploreBtn: "योजनाएं खोजें",
    bookmarksSearchPlaceholder: "सहेजी गई योजनाओं में खोजें...",
    bookmarksCountBadge: "सहेजी गई योजनाएं",
    bookmarksLoading: "आपकी सहेजी गई योजनाएं लोड हो रही हैं...",
    bookmarksShowingCount: "सहेजी गई कल्याणकारी योजनाएं",
    bookmarksCategoryLabel: "श्रेणी:",
    bookmarksAllChip: "सभी",

    // About Page
    aboutTitle: "योजना द्वार (Yojana Dvar) के बारे में",
    aboutSubtitle: "भारतीय महिलाओं के लिए आसान, पारदर्शी और सुलभ सरकारी कल्याणकारी योजना खोज मंच।",
    aboutBadge: "ओपन-सोर्स नागरिक तकनीक • भारत के लिए समर्पित",
    aboutMissionHeading: "परियोजना का उद्देश्य",
    aboutVisionSubheading: "दृष्टिकोण व उद्देश्य",
    aboutMissionP1: "भारत सरकार और राज्य सरकारों द्वारा महिलाओं के कल्याण के लिए सैकड़ों योजनाएं चलाई जा रही हैं। परंतु जटिल प्रशासनिक भाषा के कारण पात्र महिलाएं इनसे वंचित रह जाती हैं।",
    aboutMissionP2: "योजना द्वार इसी दूरी को पाटने के लिए बनाया गया है, जहाँ नागरिक सरल जानकारी देकर तुरंत अपनी पात्र योजनाओं को हिंदी व अंग्रेजी में समझ सकते हैं।",
    aboutImpactQuote: "“भारत की प्रत्येक महिला को अपने उत्थान के लिए बनी सरकारी कल्याणकारी योजनाओं को बिना किसी बिचौलिए के आसानी से जानने, समझने और प्राप्त करने का संवैधानिक व सामाजिक अधिकार है।”",
    aboutPillarsHeading: "मूल सिद्धांत",
    aboutPillarsSubheading: "तकनीक व सिद्धांत",
    aboutDataSourcesHeading: "डेटा स्रोत एवं श्रेय",
    aboutDataSourcesDesc: "हमारा कैटलॉग भारत सरकार के आधिकारिक सार्वजनिक डोमेन और ओपन डेटा रिपॉजिटरी से सत्यापित है:",
    aboutDataTransparency: "डेटा पारदर्शिता",
    aboutDataSourceLabel: "स्रोत:",
    aboutTrademarksNote: "सभी योजना नाम, पात्रता नियम, नोडल दिशानिर्देश एवं पोर्टल ट्रेडमार्क भारत सरकार तथा संबंधित राज्य सरकारों के नोडल मंत्रालयों के हैं।",
    aboutLegalDisclaimerHeading: "कानूनी अस्वीकरण",
    aboutLegalDisclaimerP1: "महत्वपूर्ण सूचना: योजना द्वार एक स्वतंत्र नागरिक तकनीक मंच है। यह कोई सरकारी एजेंसी नहीं है।",
    aboutLegalDisclaimerP2: "योजना द्वार कोई शुल्क नहीं लेता और न ही प्रत्यक्ष लाभ वितरित करता है। लाभ संवितरण का पूर्ण अधिकार केवल संबंधित सरकार के पास है।",
    aboutLegalDisclaimerP3: "नागरिकों को हमेशा संबंधित आधिकारिक सरकारी पोर्टलों (*.gov.in और *.nic.in) पर जाकर ही आवेदन प्रस्तुत करना चाहिए।",
    aboutOfficialPortalsHeading: "मान्यता प्राप्त सरकारी पोर्टल",
    aboutGatewaysSubheading: "नोडल सरकारी पोर्टल",
    aboutVisitPortal: "आधिकारिक पोर्टल पर जाएं",
    aboutCtaHeading: "क्या आप अपने सरकारी अधिकारों को खोजने के लिए तैयार हैं?",
    aboutCtaSubtitle: "अपना राज्य, आयु और स्थिति दर्ज करें और एआई द्वारा सरल भाषा में समझाई गई अपनी सभी केंद्रीय व राज्य योजनाओं की सूची तुरंत पाएं।",
    aboutCtaButton: "अपनी योजनाएं खोजें",
    aboutMadeWithLove: "भारतीय महिलाओं के सशक्तिकरण और कल्याण हेतु ❤️ से निर्मित",

    footerDisclaimer: "अस्वीकरण: योजना द्वार एक सूचनात्मक मंच है, सरकारी एजेंसी नहीं। पात्रता की अंतिम पुष्टि आधिकारिक सरकारी पोर्टल पर करें।",
    footerRights: "© 2026 योजना द्वार। भारतीय महिला सशक्तिकरण और डिजिटल समावेशन के लिए समर्पित।",
    footerGovtPortals: "सरकारी पोर्टल: myScheme.gov.in • महिला एवं बाल विकास मंत्रालय • डिजिटल इंडिया",
    footerAbout: "योजना द्वार के बारे में",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerAccessibility: "सुलभता मानक",
    footerMadeWithLove: "भारतीय महिला सशक्तिकरण हेतु ❤️ से निर्मित"
  }
};
