import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { 
  getSchemeById, 
  explainSchemeEligibility,
  getStoredUserProfile
} from '../services/api';
import type { 
  SchemeMatchResult, 
  ExplainResponse, 
  ProfileInput 
} from '../services/api';
import { getLocalizedSchemeField } from '../i18n/schemeTranslations';
import { getStateDisplayName } from '../constants/states';
import { useSpeech } from '../utils/speech';
import { 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Building2, 
  Gift, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  UserCheck,
  X,
  BookmarkCheck,
  Calendar,
  IndianRupee,
  MapPin,
  Tag,
  ShieldCheck,
  HelpCircle,
  FileText,
  Volume2,
  VolumeX,
  HeartHandshake,
  Landmark,
  Laptop,
  FileDown,
  Lock,
  GraduationCap,
  Stethoscope,
  Briefcase
} from 'lucide-react';
import { extractUrls } from '../utils/urlParser';
import FormattedApplicationText from '../components/schemes/FormattedApplicationText';

const DEFAULT_PROFILE: ProfileInput = {
  state: 'Uttar Pradesh',
  age: 26,
  gender: 'Female',
  caste: 'General',
  income: 120000,
  residence: 'Rural',
  life_stage: 'all',
  is_bpl: false,
  has_disability: false,
  limit: 10
};

// Common Document Translations Dictionary for 100% Hindi Fidelity & Issuance Helper Badges
const COMMON_DOC_TRANSLATIONS: Record<string, { 
  en?: string;
  hi: string; 
  hint_en?: string;
  hint_hi: string; 
  authority_hi: string; 
  authority_en: string; 
  isSpecial: boolean;
}> = {
  // Student & School Specific Documents
  'school id': { 
    en: "Copy of Student's School ID card or admission receipt",
    hi: 'छात्रा का स्कूल पहचान पत्र या प्रवेश रसीद (School ID / Admission Receipt)', 
    hint_en: 'Current academic session enrollment and identity proof',
    hint_hi: 'वर्तमान शैक्षणिक सत्र में विद्यालय में अध्ययनरत होने का प्रमाण', 
    authority_hi: 'संबंधित विद्यालय / कॉलेज प्रशासन', 
    authority_en: 'School / College Administration', 
    isSpecial: true 
  },
  'student id': { 
    en: "Copy of Student's School ID card or admission receipt",
    hi: 'छात्रा का स्कूल पहचान पत्र या प्रवेश रसीद (School ID Card)', 
    hint_en: 'Current session student identification issued by school/college',
    hint_hi: 'विद्यालय या कॉलेज द्वारा जारी पहचान पत्र', 
    authority_hi: 'संबंधित विद्यालय / कॉलेज', 
    authority_en: 'School / College Authority', 
    isSpecial: true 
  },
  'admission receipt': { 
    en: 'Admission Fee Receipt / Bonafide Certificate',
    hi: 'दाखिला रसीद / बोनाफाइड प्रमाण पत्र (Admission Receipt / Bonafide)', 
    hint_en: 'Proof of regular admission in recognized school or college',
    hint_hi: 'मान्यता प्राप्त स्कूल या कॉलेज में नियमित दाखिले का प्रमाण पत्र', 
    authority_hi: 'प्रधानाचार्य / हेडमास्टर', 
    authority_en: 'School Principal / Headmaster', 
    isSpecial: true 
  },
  'bonafide': { 
    en: 'Bonafide Student Certificate',
    hi: 'बोनाफाइड छात्र प्रमाण पत्र (Bonafide Certificate)', 
    hint_en: 'Certificate of regular enrollment issued by School Principal or College Dean',
    hint_hi: 'प्रधानाचार्य द्वारा जारी नियमित छात्र प्रमाण पत्र', 
    authority_hi: 'विद्यालय प्रधानाचार्य / कॉलेज', 
    authority_en: 'School Principal / College Registrar', 
    isSpecial: true 
  },
  'parent aadhaar': { 
    en: 'Student and Parent Aadhaar Cards (for identity verification and DBT linkage)',
    hi: 'छात्रा एवं अभिभावक (माता/पिता) का आधार कार्ड', 
    hint_en: 'For identity verification, age proof, and DBT scholarship linkage',
    hint_hi: 'पहचान सत्यापन, आयु प्रमाण व डीबीटी छात्रवृत्ति लिंकिंग हेतु', 
    authority_hi: 'UIDAI / आधार सेवा केंद्र', 
    authority_en: 'UIDAI / Aadhaar Center', 
    isSpecial: false 
  },
  'student and parent aadhaar': { 
    en: 'Student and Parent Aadhaar Cards (for identity verification and DBT linkage)',
    hi: 'छात्रा एवं अभिभावक (माता/पिता) का आधार कार्ड', 
    hint_en: 'For identity verification, age proof, and DBT scholarship linkage',
    hint_hi: 'पहचान सत्यापन, आयु प्रमाण व डीबीटी छात्रवृत्ति लिंकिंग हेतु', 
    authority_hi: 'UIDAI / आधार सेवा केंद्र', 
    authority_en: 'UIDAI / Aadhaar Center', 
    isSpecial: false 
  },
  'student aadhaar': { 
    en: 'Student and Parent Aadhaar Cards (for identity verification and DBT linkage)',
    hi: 'छात्रा एवं अभिभावक (माता/पिता) का आधार कार्ड', 
    hint_en: 'For identity verification, age proof, and DBT scholarship linkage',
    hint_hi: 'पहचान सत्यापन, आयु प्रमाण व डीबीटी छात्रवृत्ति लिंकिंग हेतु', 
    authority_hi: 'UIDAI / आधार सेवा केंद्र', 
    authority_en: 'UIDAI / Aadhaar Center', 
    isSpecial: false 
  },
  'delhi residence': { 
    en: 'State / Delhi Residence Proof (if requested by the school)',
    hi: 'राज्य / दिल्ली निवास प्रमाण पत्र (यदि विद्यालय द्वारा मांगा जाए)', 
    hint_en: 'Domicile Certificate, Electricity Bill, or Ration Card showing local residence',
    hint_hi: 'मूल निवास प्रमाण पत्र, बिजली बिल या राशन कार्ड', 
    authority_hi: 'तहसीलदार / ई-डिस्ट्रिक्ट / एसडीएम', 
    authority_en: 'Tehsildar / e-District / SDM', 
    isSpecial: true 
  },
  'marksheet': { 
    en: 'Previous Year Marksheet / Report Card (attested copy)',
    hi: 'पिछली कक्षा की अंकतालिका / रिपोर्ट कार्ड (Previous Marksheet)', 
    hint_en: 'Attested copy of previous class marksheet showing qualifying marks',
    hint_hi: 'पात्रता अंकों के साथ पिछली कक्षा उत्तीर्ण करने का सत्यापित प्रमाण पत्र', 
    authority_hi: 'शिक्षा बोर्ड / विद्यालय', 
    authority_en: 'Education Board / School', 
    isSpecial: true 
  },
  'report card': { 
    en: 'Previous Academic Progress Report Card',
    hi: 'प्रगति रिपोर्ट कार्ड (Report Card)', 
    hint_en: 'Academic performance and attendance report card',
    hint_hi: 'शैक्षणिक प्रदर्शन व उपस्थिति रिपोर्ट कार्ड', 
    authority_hi: 'संबंधित विद्यालय / हेडमास्टर', 
    authority_en: 'School / Headmaster', 
    isSpecial: true 
  },

  // General & Demographics Documents
  'aadhaar': { 
    en: 'Aadhaar Card (identity & address proof)',
    hi: 'आधार कार्ड (Aadhaar Card)', 
    hint_en: 'For biometric identification and DBT subsidy linkage',
    hint_hi: 'पहचान व पते के सत्यापन हेतु', 
    authority_hi: 'UIDAI / आधार सेवा केंद्र', 
    authority_en: 'UIDAI / Aadhaar Center', 
    isSpecial: false 
  },
  'bank passbook': { 
    en: 'Copy of Bank Passbook / Account Statement (showing Account Number and IFSC Code)',
    hi: 'बैंक पासबुक / खाता विवरण (खाता संख्या व IFSC कोड सहित)', 
    hint_en: 'Active bank account showing clear Account No and IFSC Code for DBT transfer',
    hint_hi: 'डीबीटी अनुदान सीधे बैंक खाते में प्राप्त करने हेतु (खाता संख्या व IFSC कोड)', 
    authority_hi: 'बैंक शाखा / डाकघर', 
    authority_en: 'Bank Branch / Post Office', 
    isSpecial: false 
  },
  'bank account': { 
    en: 'Copy of Bank Passbook / Account Statement (showing Account Number and IFSC Code)',
    hi: 'बैंक खाता विवरण (खाता संख्या व IFSC कोड सहित)', 
    hint_en: 'Aadhaar-seeded bank account statement showing Account No and IFSC Code',
    hint_hi: 'आधार से लिंक बैंक खाता संख्या व IFSC कोड', 
    authority_hi: 'बैंक शाखा / डाकघर', 
    authority_en: 'Bank Branch / Post Office', 
    isSpecial: false 
  },
  'income certificate': { 
    en: 'Family Income Certificate (issued by Revenue Authority)',
    hi: 'आय प्रमाण पत्र (Income Certificate)', 
    hint_en: 'Annual family income limit verification certificate',
    hint_hi: 'पारिवारिक वार्षिक आय सीमा सत्यापन', 
    authority_hi: 'तहसीलदार / CSC केंद्र', 
    authority_en: 'Tehsildar / CSC Center', 
    isSpecial: true 
  },
  'caste certificate': { 
    en: 'Caste Certificate (SC / ST / OBC category, if applicable)',
    hi: 'जाति प्रमाण पत्र (Caste Certificate)', 
    hint_en: 'Reserved category certificate issued by competent authority',
    hint_hi: 'आरक्षित श्रेणी प्रमाण पत्र (यदि लागू हो)', 
    authority_hi: 'एसडीएम / ई-डिस्ट्रिक्ट केंद्र', 
    authority_en: 'SDM / e-District Center', 
    isSpecial: true 
  },
  'domicile': { 
    en: 'Domicile / Permanent Residence Certificate',
    hi: 'मूल निवास प्रमाण पत्र (Domicile Certificate)', 
    hint_en: 'State or Union Territory permanent residency proof',
    hint_hi: 'राज्य में स्थायी निवास का प्रमाण', 
    authority_hi: 'तहसीलदार / जन सेवा केंद्र', 
    authority_en: 'Tehsildar / CSC Center', 
    isSpecial: true 
  },
  'residence': { 
    en: 'State Residence Proof (Domicile / Electricity Bill / Ration Card)',
    hi: 'निवास प्रमाण पत्र (Residence Certificate)', 
    hint_en: 'Proof of local residence in the state / ward',
    hint_hi: 'स्थानीय निवास सत्यापन हेतु', 
    authority_hi: 'तहसीलदार / जन सेवा केंद्र', 
    authority_en: 'Tehsildar / CSC Center', 
    isSpecial: true 
  },
  'passport': { 
    en: 'Recent Passport Size Photographs (2 copies)',
    hi: 'पासपोर्ट साइज रंगीन फोटो (Passport Photos)', 
    hint_en: 'Recent color passport-size photos with white background',
    hint_hi: 'नवीनतम रंगीन पासपोर्ट आकार की फोटो', 
    authority_hi: 'घर पर उपलब्ध / फोटो स्टूडियो', 
    authority_en: 'Recent Photograph', 
    isSpecial: false 
  },
  'photo': { 
    en: 'Recent Passport Size Photographs',
    hi: 'पासपोर्ट साइज रंगीन फोटो (Passport Photos)', 
    hint_en: 'Recent color photographs of applicant',
    hint_hi: 'नवीनतम रंगीन पासपोर्ट आकार की फोटो', 
    authority_hi: 'घर पर उपलब्ध / फोटो स्टूडियो', 
    authority_en: 'Recent Photograph', 
    isSpecial: false 
  },
  'bpl': { 
    en: 'BPL / Antyodaya Ration Card',
    hi: 'बीपीएल राशन कार्ड (BPL / Antyodaya Card)', 
    hint_en: 'Below Poverty Line or Antyodaya food security card',
    hint_hi: 'गरीबी रेखा कार्ड या अंत्योदय अन्न योजना कार्ड', 
    authority_hi: 'खाद्य एवं रसद विभाग', 
    authority_en: 'Food & Civil Supplies Dept', 
    isSpecial: false 
  },
  'ration card': { 
    en: 'Ration Card (Family Members List)',
    hi: 'राशन कार्ड (Ration Card)', 
    hint_en: 'Food supply ration card with family member names',
    hint_hi: 'परिवार के सदस्यों के नाम सहित राशन कार्ड', 
    authority_hi: 'खाद्य एवं रसद विभाग', 
    authority_en: 'Food & Civil Supplies Dept', 
    isSpecial: false 
  },
  'disability': { 
    en: 'Disability Certificate / UDID Card (40%+ disability)',
    hi: 'दिव्यांगता प्रमाण पत्र (Disability / UDID Card)', 
    hint_en: 'CMO-issued Unique Disability ID or certificate with 40%+ disability',
    hint_hi: 'सीएमओ द्वारा जारी 40%+ दिव्यांगता कार्ड', 
    authority_hi: 'मुख्य चिकित्सा अधिकारी (CMO)', 
    authority_en: 'Chief Medical Officer (CMO)', 
    isSpecial: true 
  },
  'birth certificate': { 
    en: 'Birth Certificate (Applicant / Child)',
    hi: 'जन्म प्रमाण पत्र (Birth Certificate)', 
    hint_en: 'Official date of birth certificate from Registrar / Municipality',
    hint_hi: 'बालिका/आवेदक की जन्म तिथि का प्रमाण', 
    authority_hi: 'नगर निगम / ग्राम पंचायत', 
    authority_en: 'Municipal / Panchayat Office', 
    isSpecial: true 
  },
  'age proof': { 
    en: 'Age Proof (10th Marksheet / Birth Certificate / Voter ID)',
    hi: 'आयु प्रमाण पत्र (Age Proof)', 
    hint_en: '10th class certificate or birth certificate showing date of birth',
    hint_hi: '10वीं अंकतालिका या जन्म प्रमाण पत्र', 
    authority_hi: 'विद्यालय / जन्म रजिस्ट्रार', 
    authority_en: 'School / Registrar', 
    isSpecial: false 
  },
  'educational': { 
    en: 'Educational Qualification Certificates & Marksheets',
    hi: 'शैक्षणिक योग्यता प्रमाण पत्र (Educational Certificate)', 
    hint_en: 'Degree, diploma, or school passing certificates',
    hint_hi: 'अंकतालिका एवं विद्यालय/कॉलेज प्रमाण पत्र', 
    authority_hi: 'संबंधित विद्यालय / कॉलेज', 
    authority_en: 'School / University', 
    isSpecial: true 
  },
  'mcp card': { 
    en: 'Mother and Child Protection (MCP) Card',
    hi: 'मातृ एवं बाल सुरक्षा कार्ड (MCP Card)', 
    hint_en: 'Health card issued by Anganwadi or Government Hospital for ANC/immunisation',
    hint_hi: 'आंगनवाड़ी या सरकारी अस्पताल से जारी कार्ड', 
    authority_hi: 'आंगनवाड़ी / सरकारी अस्पताल', 
    authority_en: 'Anganwadi / Govt Hospital', 
    isSpecial: true 
  },
  'mother and child': { 
    en: 'Mother and Child Protection (MCP) Card',
    hi: 'मातृ एवं बाल सुरक्षा कार्ड (MCP Card)', 
    hint_en: 'Maternal health and child tracking card with doctor stamp',
    hint_hi: 'आंगनवाड़ी या सरकारी अस्पताल से जारी कार्ड', 
    authority_hi: 'आंगनवाड़ी / सरकारी अस्पताल', 
    authority_en: 'Anganwadi / Govt Hospital', 
    isSpecial: true 
  },
  'jan aadhaar': { 
    en: 'Jan Aadhaar Card (Rajasthan Family ID)',
    hi: 'जन आधार कार्ड (Jan Aadhaar Card)', 
    hint_en: 'Rajasthan unified family identity card',
    hint_hi: 'राजस्थान परिवार पहचान कार्ड', 
    authority_hi: 'राजस्थान ई-मित्र केंद्र', 
    authority_en: 'Rajasthan e-Mitra', 
    isSpecial: false 
  },
  'land records': { 
    en: 'Land Ownership Records / RoR / Khasra-Khatauni',
    hi: 'भूमि दस्तावेज / खतौनी (Land Records / RoR)', 
    hint_en: 'Land revenue registry or lease title copy',
    hint_hi: 'जमीन की जमाबंदी या पट्टा प्रति', 
    authority_hi: 'राजस्व विभाग / लेखपाल', 
    authority_en: 'Revenue Dept / Patwari', 
    isSpecial: true 
  },
  'death certificate': { 
    en: "Husband's Death Certificate (for widow pension)",
    hi: 'पति का मृत्यु प्रमाण पत्र (Husband\'s Death Certificate)', 
    hint_en: 'Required for widow pension and family assistance eligibility verification',
    hint_hi: 'विधवा पेंशन व पारिवारिक सहायता सत्यापन हेतु नगर निगम / ग्राम पंचायत द्वारा जारी', 
    authority_hi: 'नगर निगम / ग्राम पंचायत', 
    authority_en: 'Municipal / Panchayat Office', 
    isSpecial: true 
  },
  'husband death certificate': { 
    en: "Husband's Death Certificate (for widow pension)",
    hi: 'पति का मृत्यु प्रमाण पत्र (Husband\'s Death Certificate)', 
    hint_en: 'Official death certificate issued by Registrar / Municipality / Panchayat',
    hint_hi: 'विधवा पेंशन व पारिवारिक सहायता सत्यापन हेतु', 
    authority_hi: 'नगर निगम / ग्राम पंचायत', 
    authority_en: 'Municipal / Panchayat Office', 
    isSpecial: true 
  },
  'marriage certificate': { 
    en: 'Marriage Registration Certificate',
    hi: 'विवाह प्रमाण पत्र (Marriage Certificate)', 
    hint_en: 'Official marriage certificate from Marriage Registrar or SDM Office',
    hint_hi: 'विवाह पंजीकरण एवं अंतरजातीय विवाह प्रोत्साहन योजना सत्यापन', 
    authority_hi: 'विवाह पंजीयक / एसडीएम कार्यालय / ई-डिस्ट्रिक्ट', 
    authority_en: 'Marriage Registrar / SDM Office / e-District', 
    isSpecial: true 
  },
  'intercaste certificate': { 
    en: 'Inter-Caste Marriage Certificate & Joint Affidavit',
    hi: 'अंतरजातीय विवाह प्रमाण पत्र (Inter-Caste Marriage Certificate)', 
    hint_en: 'Caste certificates of both spouses and registered marriage proof',
    hint_hi: 'पति एवं पत्नी दोनों का जाति प्रमाण पत्र व विवाह प्रमाण पत्र', 
    authority_hi: 'एसडीएम / समाज कल्याण विभाग', 
    authority_en: 'SDM / Social Welfare Dept', 
    isSpecial: true 
  },
  'self-declaration': { 
    en: 'Self-Declaration Form / Undertaking',
    hi: 'स्व-घोषणा पत्र (Self-Declaration)', 
    hint_en: 'Self-attested declaration format as prescribed by scheme rules',
    hint_hi: 'शपथ पत्र या निर्धारित प्रारूप पर घोषणा', 
    authority_hi: 'स्व-हस्ताक्षरित प्रारूप', 
    authority_en: 'Self-Attested Format', 
    isSpecial: false 
  },
  'affidavit': { 
    en: 'Notarized Affidavit (Oath Commissioner)',
    hi: 'शपथ पत्र (Affidavit)', 
    hint_en: 'Affidavit attested by Notary Public or Oath Commissioner',
    hint_hi: 'नोटरी या शपथ आयुक्त द्वारा सत्यापित', 
    authority_hi: 'नोटरी / शपथ आयुक्त', 
    authority_en: 'Notary / Oath Commissioner', 
    isSpecial: true 
  },
  'mobile number': { 
    en: 'Aadhaar-Linked Active Mobile Number (for OTP & SMS)',
    hi: 'आधार लिंक मोबाइल नंबर (Mobile Number)', 
    hint_en: 'Active mobile number linked with Aadhaar for OTP verification and DBT SMS alerts',
    hint_hi: 'ओटीपी सत्यापन व एसएमएस सूचनाओं हेतु', 
    authority_hi: 'सक्रिय मोबाइल सिम कार्ड', 
    authority_en: 'Active Mobile SIM', 
    isSpecial: false 
  },
  'voter id': { 
    en: 'Voter Identity Card (EPIC)',
    hi: 'मतदाता पहचान पत्र (Voter ID)', 
    hint_en: 'Alternative photo identity card issued by Election Commission',
    hint_hi: 'वैकल्पिक पहचान पत्र', 
    authority_hi: 'चुनाव आयोग (ECI)', 
    authority_en: 'Election Commission (ECI)', 
    isSpecial: false 
  },
};

function parseDocuments(docString?: string): string[] {
  if (!docString) return [];
  return docString
    .split(/[,;\n]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 2);
}

function resolveSchemeDocuments(scheme?: SchemeMatchResult | null): string[] {
  if (!scheme) return [];
  
  const parsed = parseDocuments(scheme.documents_required);
  // Check if parsed has at least 2 distinct meaningful documents
  const isGeneric = parsed.length === 0 || (parsed.length <= 1 && (
    parsed[0].toLowerCase().includes('as per') || 
    parsed[0].toLowerCase().includes('guideline') || 
    parsed[0].toLowerCase().includes('website') ||
    parsed[0].toLowerCase().includes('applicable') ||
    parsed[0].length < 10
  ));

  if (!isGeneric && parsed.length >= 2) {
    return parsed;
  }

  // Synthesize domain-aware fallback documents based on scheme metadata
  const cat = (scheme.category || '').toLowerCase();
  const tags = (scheme.life_stage_tags || '').toLowerCase();
  const benType = (scheme.beneficiary_type || '').toLowerCase();
  const name = (scheme.name || '').toLowerCase();
  const desc = (scheme.description || '').toLowerCase();

  const isStudent = 
    cat.includes('education') || 
    cat.includes('scholarship') || 
    tags.includes('student') || 
    tags.includes('youth') || 
    benType.includes('student') || 
    benType.includes('scholar') || 
    benType.includes('children') || 
    benType.includes('girl child') || 
    benType.includes('girls') || 
    name.includes('scholarship') || 
    name.includes('student') || 
    name.includes('fellowship') || 
    name.includes('school') || 
    name.includes('merit') || 
    name.includes('ladli') || 
    name.includes('pragati') || 
    name.includes('saksham') || 
    name.includes('super 30') || 
    desc.includes('scholarship');

  if (isStudent) {
    const docs = [
      "Copy of the student's School ID card or admission receipt",
      "Student and parent Aadhaar cards (for identity verification and DBT linkage)",
      "Copy of bank passbook / account statement (showing Account Number and IFSC Code)",
      "Previous year Marksheet / Report Card (attested copy)",
      "State / Delhi residence proof (if requested by the school)"
    ];
    if (scheme.income_max || (scheme.caste_categories && scheme.caste_categories.toLowerCase() !== 'all')) {
      docs.push("Family Income Certificate & Category/Caste Certificate (if applicable)");
    }
    return docs;
  }

  const isMaternity = 
    cat.includes('health') || 
    cat.includes('maternity') || 
    cat.includes('nutrition') || 
    tags.includes('pregnant') || 
    tags.includes('lactating') || 
    benType.includes('pregnant') || 
    name.includes('matru') || 
    name.includes('pmmvy') || 
    name.includes('maternity');

  if (isMaternity) {
    return [
      "Mother and Child Protection (MCP) Card (from Anganwadi or Govt Hospital)",
      "Aadhaar Card of pregnant woman and husband (identity proof)",
      "Copy of bank passbook / account statement (showing Account Number and IFSC Code)",
      "State residence proof / Ration Card",
      "Institutional delivery / ANC checkup record"
    ];
  }

  const isPension = 
    cat.includes('pension') || 
    tags.includes('widow') || 
    tags.includes('senior') || 
    benType.includes('widow') || 
    name.includes('pension') || 
    name.includes('widow');

  if (isPension) {
    const docs = [
      "Aadhaar Card of applicant (identity and age proof)",
      "Copy of bank passbook / account statement (showing Account Number and IFSC Code)",
      "State residence proof / Domicile Certificate",
      "Income Certificate / BPL Ration Card"
    ];
    if (name.includes('widow') || tags.includes('widow') || benType.includes('widow')) {
      docs.push("Husband's Death Certificate (issued by Municipal / Panchayat office)");
    }
    return docs;
  }

  // General fallback documents
  return [
    "Aadhaar Card (identity & address proof)",
    "Copy of bank passbook / account statement (showing Account Number and IFSC Code)",
    "State residence proof / Domicile Certificate",
    "Family Income Certificate / BPL Ration Card (if applicable)",
    "Recent Passport Size Photographs (2 copies)"
  ];
}

function localizeDocumentName(doc: string, lang: 'en' | 'hi'): { name: string; hint?: string; authority?: string; isSpecial: boolean } {
  const lower = doc.toLowerCase().trim();
  for (const [key, val] of Object.entries(COMMON_DOC_TRANSLATIONS)) {
    if (lower.includes(key)) {
      return { 
        name: lang === 'hi' ? val.hi : (val.en || doc), 
        hint: lang === 'hi' ? val.hint_hi : val.hint_en,
        authority: lang === 'hi' ? val.authority_hi : val.authority_en,
        isSpecial: val.isSpecial
      };
    }
  }
  const isSpecialFallback = lower.includes('certificate') || lower.includes('marksheet') || lower.includes('proof') || lower.includes('affidavit') || lower.includes('praman') || lower.includes('bonafide') || lower.includes('receipt') || lower.includes('id card');
  return { 
    name: doc,
    hint: undefined,
    isSpecial: isSpecialFallback,
    authority: isSpecialFallback ? (lang === 'hi' ? 'सक्षम अधिकारी / संस्थान' : 'Issuing Authority / Institution') : (lang === 'hi' ? 'घर पर उपलब्ध' : 'Available at Home')
  };
}

function localizeBeneficiaryType(type: string | undefined, lang: 'en' | 'hi'): string {
  if (!type) return '';
  if (lang !== 'hi') return type;
  const lower = type.toLowerCase();
  if (lower.includes('pregnant') || lower.includes('lactating')) return 'गर्भवती एवं धात्री माताएं (Pregnant & Lactating Mothers)';
  if (lower.includes('widow')) return 'विधवा महिलाएं (Widows)';
  if (lower.includes('student') || lower.includes('girl child') || lower.includes('girls')) return 'छात्राएं एवं बालिकाएं (Girl Students / Girls)';
  if (lower.includes('entrepreneur') || lower.includes('shg') || lower.includes('women')) return 'महिलाएं एवं महिला उद्यमी (Women / SHGs)';
  if (lower.includes('senior') || lower.includes('elderly')) return 'वरिष्ठ नागरिक महिलाएं (Senior Women)';
  if (lower.includes('pwd') || lower.includes('disability')) return 'दिव्यांग महिलाएं (Women with Disabilities)';
  if (lower.includes('farmer') || lower.includes('rural')) return 'महिला किसान एवं ग्रामीण महिलाएं (Rural Women)';
  return type;
}

function parseEligibilityPoints(eligibilityText?: string): string[] {
  if (!eligibilityText) return [];
  const points = eligibilityText
    .split(/(?:•|\n|;|\.\s+)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);
  return points.length > 0 ? points : [eligibilityText];
}

function formatCasteCategories(rawCaste: string | string[] | undefined, lang: 'en' | 'hi' = 'en'): string {
  if (!rawCaste) {
    return lang === 'hi' ? 'सभी सामाजिक वर्ग (All Categories)' : 'All Categories (General, SC, ST, OBC)';
  }

  let categories: string[] = [];
  if (Array.isArray(rawCaste)) {
    categories = rawCaste;
  } else if (typeof rawCaste === 'string') {
    const trimmed = rawCaste.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          categories = parsed;
        }
      } catch {
        categories = [trimmed.replace(/[\[\]"']/g, '')];
      }
    } else {
      categories = trimmed.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    }
  }

  const cleanCats = categories.map((c) => String(c).trim()).filter(Boolean);
  if (cleanCats.length === 0 || cleanCats.some((c) => c.toLowerCase() === 'all')) {
    return lang === 'hi' ? 'सभी सामाजिक वर्ग (All Categories)' : 'All Categories (General, SC, ST, OBC)';
  }

  const casteMapHi: Record<string, string> = {
    SC: 'अनुसूचित जाति (SC)',
    ST: 'अनुसूचित जनजाति (ST)',
    OBC: 'अन्य पिछड़ा वर्ग (OBC)',
    General: 'सामान्य वर्ग (General)',
    EWS: 'आर्थिक कमजोर वर्ग (EWS)',
    Minority: 'अल्पसंख्यक वर्ग (Minority)'
  };

  if (lang === 'hi') {
    const hiCats = cleanCats.map((c) => casteMapHi[c] || c);
    return hiCats.length === 1 ? `केवल ${hiCats[0]}` : hiCats.join(' / ');
  }

  return cleanCats.length === 1 ? `${cleanCats[0]} Only` : `${cleanCats.join(' & ')} Only`;
}

function formatAgeBounds(ageMin: number | undefined, ageMax: number | undefined, lang: 'en' | 'hi' = 'en'): string {
  const min = ageMin ?? 0;
  const max = ageMax ?? 100;

  if (min === 0 && max >= 100) {
    return lang === 'hi' ? 'सभी आयु वर्ग पात्र (All Ages)' : 'All Ages Eligible';
  }
  if (min === 0 && max <= 10) {
    return lang === 'hi' ? `0 से ${max} वर्ष (बालिकाएं व शिशु)` : `0 – ${max} Yrs (Infants & Children)`;
  }
  if (min === 0 && max < 100) {
    return lang === 'hi' ? `0 से ${max} वर्ष (बालिकाएं व किशोरियां)` : `0 – ${max} Yrs (Girls & Youth)`;
  }
  if (min >= 18 && max >= 100) {
    return lang === 'hi' ? '18+ वर्ष (वयस्क महिलाएं)' : '18+ Years (Adults)';
  }
  if (min >= 60) {
    return lang === 'hi' ? `${min}+ वर्ष (वरिष्ठ नागरिक)` : `${min}+ Years (Senior Citizens)`;
  }
  return lang === 'hi' ? `${min} से ${max} वर्ष` : `${min} – ${max} Yrs`;
}

function formatResidenceScope(residence: string | undefined, lang: 'en' | 'hi' = 'en'): string {
  const res = (residence || 'All').trim().toLowerCase();
  if (res === 'rural') {
    return lang === 'hi' ? 'केवल ग्रामीण क्षेत्र (Rural Only)' : 'Rural Areas Only';
  }
  if (res === 'urban') {
    return lang === 'hi' ? 'केवल शहरी क्षेत्र (Urban Only)' : 'Urban / Municipal Areas Only';
  }
  return lang === 'hi' ? 'ग्रामीण व शहरी दोनों (All Areas)' : 'Rural & Urban (All Areas)';
}

function formatIncomeCap(incomeMax: number | undefined, lang: 'en' | 'hi' = 'en'): string {
  if (incomeMax && incomeMax > 0) {
    return `≤ ₹${incomeMax.toLocaleString('en-IN')}`;
  }
  return lang === 'hi' ? 'कोई अधिकतम आय सीमा नहीं (No Limit)' : 'No Maximum Income Limit';
}

function formatCrispQuickSummary(text: string, maxSentences = 4, lang: 'en' | 'hi' = 'en'): string {
  if (!text) return '';
  const cleaned = text
    .replace(/[*_~`#]/g, '')
    .replace(/^[•\-\*\s:;,.]+/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/^(The scheme\s*“?[^”"]*”?\s*was launched by|The scheme\s*“?[^”"]*”?\s*aims to|This scheme aims to|Under this scheme|यह योजना\s*|योजना के तहत\s*)/i, '')
    .trim();

  if (!cleaned) return '';

  // Tokenize by sentence boundaries (English .!? and Hindi ।!?)
  const sentenceRegex = /[^.!?।]+(?:[.!?।]+|$)/g;
  const matches = cleaned.match(sentenceRegex) || [cleaned];
  
  const validSentences = matches
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  if (validSentences.length === 0) return cleaned;

  const selected = validSentences.slice(0, maxSentences);
  let result = selected.join(' ').trim();

  // Ensure clean sentence termination
  const terminalPunc = lang === 'hi' ? '।' : '.';
  if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?') && !result.endsWith('।')) {
    result = result.replace(/[,;:\-\s]+$/, '') + terminalPunc;
  }

  return result;
}

interface OfflineTouchpoint {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  cardClass: string;
  iconBgClass: string;
  titleClass: string;
  roleClass: string;
  badgeBorderClass: string;
  badgeTextClass: string;
  badgeIconClass: string;
  title: string;
  role: string;
  action: string;
  badge: string;
}

function getOfflineTouchpoints(scheme: SchemeMatchResult, lang: 'en' | 'hi'): OfflineTouchpoint[] {
  const cat = (scheme.category || '').toLowerCase();
  const tags = (scheme.life_stage_tags || '').toLowerCase();
  const benType = (scheme.beneficiary_type || '').toLowerCase();
  const name = (scheme.name || '').toLowerCase();
  const desc = (scheme.description || '').toLowerCase();

  const isStudent = 
    cat.includes('education') || 
    cat.includes('scholarship') || 
    tags.includes('student') || 
    tags.includes('youth') || 
    benType.includes('student') || 
    benType.includes('scholar') || 
    benType.includes('children') || 
    benType.includes('girl child') || 
    benType.includes('girls') || 
    name.includes('scholarship') || 
    name.includes('student') || 
    name.includes('fellowship') || 
    name.includes('school') || 
    name.includes('merit') || 
    name.includes('ladli') || 
    name.includes('pragati') || 
    name.includes('saksham') || 
    name.includes('super 30') || 
    name.includes('internship') || 
    name.includes('coaching') || 
    desc.includes('scholarship') || 
    desc.includes('secondary education');

  const isMaternity = 
    cat.includes('health') || 
    cat.includes('maternity') || 
    cat.includes('nutrition') || 
    tags.includes('pregnant') || 
    tags.includes('lactating') || 
    tags.includes('infant') || 
    benType.includes('pregnant') || 
    benType.includes('lactating') || 
    benType.includes('mother') || 
    name.includes('matru') || 
    name.includes('pmmvy') || 
    name.includes('maternity') || 
    name.includes('poshan') || 
    name.includes('janani') || 
    desc.includes('pregnant') || 
    desc.includes('maternity');

  const isPension = 
    cat.includes('pension') || 
    cat.includes('social security') || 
    tags.includes('widow') || 
    tags.includes('senior') || 
    tags.includes('pwd') || 
    tags.includes('disability') || 
    benType.includes('widow') || 
    benType.includes('elderly') || 
    benType.includes('senior') || 
    benType.includes('disability') || 
    name.includes('pension') || 
    name.includes('widow') || 
    name.includes('divyang') || 
    name.includes('ignwps') || 
    name.includes('old age') || 
    desc.includes('pension');

  const isLivelihood = 
    cat.includes('business') || 
    cat.includes('entrepreneur') || 
    cat.includes('employment') || 
    cat.includes('skill') || 
    cat.includes('credit') || 
    cat.includes('agriculture') || 
    cat.includes('livelihood') || 
    tags.includes('entrepreneur') || 
    tags.includes('shg') || 
    tags.includes('artisan') || 
    tags.includes('farmer') || 
    benType.includes('entrepreneur') || 
    benType.includes('shg') || 
    benType.includes('women entrepreneur') || 
    benType.includes('farmer') || 
    name.includes('mudra') || 
    name.includes('stand-up') || 
    name.includes('svanidhi') || 
    name.includes('shg') || 
    name.includes('startup') || 
    name.includes('livelihood') || 
    name.includes('kisan') || 
    desc.includes('loan') || 
    desc.includes('entrepreneur');

  if (isStudent) {
    return [
      {
        id: 'student_school',
        icon: GraduationCap,
        cardClass: 'bg-indigo-50/70 border-indigo-200 text-charcoal-800',
        iconBgClass: 'bg-indigo-100 text-indigo-800',
        titleClass: 'text-indigo-950',
        roleClass: 'text-indigo-800',
        badgeBorderClass: 'border-indigo-200/60',
        badgeTextClass: 'text-indigo-900',
        badgeIconClass: 'text-indigo-600',
        title: lang === 'hi' ? '1. विद्यालय / कॉलेज प्रधानाचार्य कार्यालय' : "1. School / College Principal's Office",
        role: lang === 'hi' ? 'प्रधानाचार्य, हेडमास्टर या छात्रवृत्ति नोडल शिक्षक' : 'Principal, Headmaster or Scholarship In-Charge',
        action: lang === 'hi' 
          ? 'विद्यालय के प्रधानाचार्य या छात्रवृत्ति प्रभारी शिक्षक से मिलकर दाखिला व अंकतालिका सत्यापित कराएं, बोनाफाइड प्रमाण पत्र प्राप्त करें और ऑफलाइन फॉर्म स्कूल से अग्रसारित कराएं।' 
          : 'Meet your school principal, headmaster, or scholarship teacher to verify student admission, attest marksheets/bonafide certificates, and forward offline scholarship forms directly.',
        badge: lang === 'hi' ? '100% निःशुल्क विद्यालय सत्यापन' : '100% Free School Verification'
      },
      {
        id: 'student_deo',
        icon: Landmark,
        cardClass: 'bg-emerald-50/70 border-emerald-200 text-charcoal-800',
        iconBgClass: 'bg-emerald-100 text-emerald-800',
        titleClass: 'text-emerald-950',
        roleClass: 'text-emerald-800',
        badgeBorderClass: 'border-emerald-200/60',
        badgeTextClass: 'text-emerald-900',
        badgeIconClass: 'text-emerald-600',
        title: lang === 'hi' ? '2. जिला शिक्षा / समाज कल्याण अधिकारी (DEO / DSWO)' : '2. District Education / Social Welfare Office (DEO / DSWO)',
        role: lang === 'hi' ? 'जिला शिक्षा अधिकारी (DEO) / ब्लॉक शिक्षा अधिकारी (BEO)' : 'District Education Officer (DEO) / Block Education Desk',
        action: lang === 'hi' 
          ? 'जिला कलेक्ट्रेट या ब्लॉक शिक्षा कार्यालय जाकर छात्रवृत्ति कोटा सत्यापन, विशेष प्रोत्साहन फॉर्म जमा व संस्थागत समस्या निवारण कराएं।' 
          : 'Visit the District Education Office (DEO) or Social Welfare Office at the district collectorate for scholarship quota approval, physical verification, and appeal desk.',
        badge: lang === 'hi' ? 'जिला शिक्षा एवं कल्याण पटल' : 'District Authority Desk'
      },
      {
        id: 'student_csc',
        icon: Laptop,
        cardClass: 'bg-blue-50/70 border-blue-200 text-charcoal-800',
        iconBgClass: 'bg-blue-100 text-blue-800',
        titleClass: 'text-blue-950',
        roleClass: 'text-blue-800',
        badgeBorderClass: 'border-blue-200/60',
        badgeTextClass: 'text-blue-900',
        badgeIconClass: 'text-blue-600',
        title: lang === 'hi' ? '3. जन सेवा केंद्र / CSC / साइबर कैफे' : '3. Common Service Center (CSC / Cyber Cafe)',
        role: lang === 'hi' ? 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) / राज्य पोर्टल फॉर्म व दस्तावेज स्कैनिंग' : 'National Scholarship Portal (NSP) / State Portal Upload & Document Scanning',
        action: lang === 'hi' 
          ? 'मात्र ₹20-50 के सरकारी शुल्क पर स्कूल आईडी, अंकतालिका व पासबुक स्कैन कराएं, बायोमेट्रिक आधार e-KYC कराएं और पक्की रसीद (Acknowledgement) प्राप्त करें।' 
          : 'Pay nominal government rates (₹20-50) to scan Student ID, marksheets, bank passbook, complete biometric Aadhaar e-KYC, and get printed acknowledgement receipts.',
        badge: lang === 'hi' ? 'डिजिटल फॉर्म व पक्की रसीद' : 'Portal Upload & Receipt'
      }
    ];
  }

  if (isMaternity) {
    return [
      {
        id: 'mat_anganwadi',
        icon: HeartHandshake,
        cardClass: 'bg-rose-50/70 border-rose-200 text-charcoal-800',
        iconBgClass: 'bg-rose-100 text-rose-800',
        titleClass: 'text-rose-950',
        roleClass: 'text-rose-800',
        badgeBorderClass: 'border-rose-200/60',
        badgeTextClass: 'text-rose-900',
        badgeIconClass: 'text-rose-600',
        title: lang === 'hi' ? '1. आंगनवाड़ी केंद्र / आशा बहू (ASHA Worker)' : '1. Anganwadi Center / ASHA Worker',
        role: lang === 'hi' ? 'मातृ वंदना (PMMVY), पोषण, टीकाकरण व बालिका स्वास्थ्य' : 'Maternity (PMMVY), child nutrition, girl child & health schemes',
        action: lang === 'hi' 
          ? 'आंगनवाड़ी सेविका या आशा दीदी से मिलकर कागजी फॉर्म भरें, एमसीपी (MCP) कार्ड सत्यापित कराएं और ऑफलाइन जमा करें।' 
          : 'Meet your local Anganwadi worker or ASHA didi for physical form filling, MCP card verification, and offline document submission.',
        badge: lang === 'hi' ? '100% निःशुल्क मार्गदर्शन' : '100% Free Guidance'
      },
      {
        id: 'mat_phc',
        icon: Stethoscope,
        cardClass: 'bg-emerald-50/70 border-emerald-200 text-charcoal-800',
        iconBgClass: 'bg-emerald-100 text-emerald-800',
        titleClass: 'text-emerald-950',
        roleClass: 'text-emerald-800',
        badgeBorderClass: 'border-emerald-200/60',
        badgeTextClass: 'text-emerald-900',
        badgeIconClass: 'text-emerald-600',
        title: lang === 'hi' ? '2. प्राथमिक स्वास्थ्य केंद्र / सरकारी अस्पताल (PHC / CHC)' : '2. Primary Health Center (PHC / CHC / Govt Hospital)',
        role: lang === 'hi' ? 'चिकित्सा अधिकारी जांच, जन्म पंजीकरण व संस्थागत प्रसव प्रमाणन' : 'Medical Officer ANC checkup, birth registration & delivery records',
        action: lang === 'hi' 
          ? 'नजदीकी सरकारी अस्पताल या पीएचसी जाकर गर्भावस्था पंजीकरण, एमसीपी कार्ड सत्यापन व डॉक्टर की मुहर लगवाएं।' 
          : 'Visit the PHC or Community Health Center for pregnancy registration, MCP card stamp, and official medical officer certification.',
        badge: lang === 'hi' ? 'चिकित्सकीय सत्यापन' : 'Medical Verification'
      },
      {
        id: 'mat_csc',
        icon: Laptop,
        cardClass: 'bg-blue-50/70 border-blue-200 text-charcoal-800',
        iconBgClass: 'bg-blue-100 text-blue-800',
        titleClass: 'text-blue-950',
        roleClass: 'text-blue-800',
        badgeBorderClass: 'border-blue-200/60',
        badgeTextClass: 'text-blue-900',
        badgeIconClass: 'text-blue-600',
        title: lang === 'hi' ? '3. जन सेवा केंद्र / CSC / ई-मित्र' : '3. Common Service Center (CSC / e-Mitra)',
        role: lang === 'hi' ? 'PMMVY पोर्टल डिजिटल अपलोड व बैंक DBT आधार लिंकिंग' : 'PMMVY Portal Submission & Aadhaar DBT Linkage',
        action: lang === 'hi' 
          ? 'मात्र ₹20-50 के शुल्क पर MCP कार्ड, माता-पिता आधार व बैंक पासबुक अपलोड कराएं और रसीद प्राप्त करें।' 
          : 'Pay nominal government rates (₹20-50) to scan MCP card, Aadhaar, bank passbook, and get official online acknowledgement.',
        badge: lang === 'hi' ? 'डिजिटल फॉर्म व रसीद' : 'Portal Upload & Receipt'
      }
    ];
  }

  if (isPension) {
    return [
      {
        id: 'pension_panchayat',
        icon: Landmark,
        cardClass: 'bg-amber-50/70 border-amber-200 text-charcoal-800',
        iconBgClass: 'bg-amber-100 text-amber-800',
        titleClass: 'text-amber-950',
        roleClass: 'text-amber-800',
        badgeBorderClass: 'border-amber-200/60',
        badgeTextClass: 'text-amber-900',
        badgeIconClass: 'text-amber-600',
        title: lang === 'hi' ? '1. ग्राम पंचायत भवन / वार्ड पार्षद कार्यालय' : '1. Gram Panchayat Bhawan / Ward Councillor',
        role: lang === 'hi' ? 'विधवा पेंशन (IGNWPS), वृद्धावस्था पेंशन व स्थानीय निवास सत्यापन' : 'Widow pension (IGNWPS), old-age pension & residence endorsement',
        action: lang === 'hi' 
          ? 'पंचायत कार्यालय में सचिव या ग्राम प्रधान/पार्षद से मिलकर पारिवारिक आय/निवास प्रमाणन व ऑफलाइन फॉर्म अग्रेषित कराएं।' 
          : 'Visit the Panchayat office or Ward Councillor to verify local residence/income eligibility and submit verified application forms.',
        badge: lang === 'hi' ? 'पात्रता सत्यापन व अनुशंसा' : 'Eligibility & Verification'
      },
      {
        id: 'pension_tehsil',
        icon: Building2,
        cardClass: 'bg-emerald-50/70 border-emerald-200 text-charcoal-800',
        iconBgClass: 'bg-emerald-100 text-emerald-800',
        titleClass: 'text-emerald-950',
        roleClass: 'text-emerald-800',
        badgeBorderClass: 'border-emerald-200/60',
        badgeTextClass: 'text-emerald-900',
        badgeIconClass: 'text-emerald-600',
        title: lang === 'hi' ? '2. तहसील कार्यालय / एसडीएम / बीडीओ (Tehsil / BDO)' : '2. Tehsil / Block Development Office (BDO / SDM)',
        role: lang === 'hi' ? 'पेंशन स्वीकृति अधिकारी, मृत्यु प्रमाण पत्र जांच व सामाजिक सुरक्षा पटल' : 'Pension sanctioning officer & social security desk',
        action: lang === 'hi' 
          ? 'तहसीलदार या समाज कल्याण अधिकारी के समक्ष आय प्रमाण पत्र, आयु प्रमाण व पति का मृत्यु प्रमाण पत्र प्रस्तुत कर पेंशन स्वीकृति कराएं।' 
          : 'Submit attested certificates to the Tehsildar, BDO, or Social Welfare Officer for official pension sanctioning and roster entry.',
        badge: lang === 'hi' ? 'विभागीय स्वीकृति पटल' : 'Official Sanction Desk'
      },
      {
        id: 'pension_csc',
        icon: Laptop,
        cardClass: 'bg-blue-50/70 border-blue-200 text-charcoal-800',
        iconBgClass: 'bg-blue-100 text-blue-800',
        titleClass: 'text-blue-950',
        roleClass: 'text-blue-800',
        badgeBorderClass: 'border-blue-200/60',
        badgeTextClass: 'text-blue-900',
        badgeIconClass: 'text-blue-600',
        title: lang === 'hi' ? '3. जन सेवा केंद्र (CSC) / जीवन प्रमाण केंद्र' : '3. Common Service Center (CSC / Life Certificate)',
        role: lang === 'hi' ? 'बायोमेट्रिक जीवन प्रमाण पत्र (Life Certificate) व पेंशन e-KYC' : 'Biometric Digital Life Certificate & Portal Submission',
        action: lang === 'hi' 
          ? 'बायोमेट्रिक फिंगरप्रिंट द्वारा जीवन प्रमाण पत्र अपडेट कराएं और पेंशन पोर्टल पर आवेदन अपलोड कर रसीद प्राप्त करें।' 
          : 'Complete biometric fingerprint authentication, annual life certificate renewal, and obtain official receipt printouts.',
        badge: lang === 'hi' ? 'बायोमेट्रिक e-KYC व रसीद' : 'Biometric e-KYC & Receipt'
      }
    ];
  }

  if (isLivelihood) {
    return [
      {
        id: 'live_bank',
        icon: Building2,
        cardClass: 'bg-emerald-50/70 border-emerald-200 text-charcoal-800',
        iconBgClass: 'bg-emerald-100 text-emerald-800',
        titleClass: 'text-emerald-950',
        roleClass: 'text-emerald-800',
        badgeBorderClass: 'border-emerald-200/60',
        badgeTextClass: 'text-emerald-900',
        badgeIconClass: 'text-emerald-600',
        title: lang === 'hi' ? '1. राष्ट्रीयकृत / ग्रामीण बैंक शाखा (Bank Branch)' : '1. Public Sector / Gramin Bank Branch',
        role: lang === 'hi' ? 'मुद्रा ऋण (MUDRA), स्टैंड-अप इंडिया, SHG क्रेडिट लिंकेज' : 'MUDRA loan, Stand-Up India & SHG credit linkage officer',
        action: lang === 'hi' 
          ? 'नजदीकी बैंक शाखा प्रबंधक या ऋण अधिकारी से मिलकर प्रोजेक्ट रिपोर्ट, कोटेशन व सब्सिडी ऋण आवेदन ऑफलाइन जमा करें।' 
          : 'Meet the Branch Manager or Loan Officer to submit project proposals, machinery quotations, and subsidy loan applications.',
        badge: lang === 'hi' ? 'बैंक ऋण व सब्सिडी पटल' : 'Bank Credit & Subsidy Desk'
      },
      {
        id: 'live_dic',
        icon: Briefcase,
        cardClass: 'bg-amber-50/70 border-amber-200 text-charcoal-800',
        iconBgClass: 'bg-amber-100 text-amber-800',
        titleClass: 'text-amber-950',
        roleClass: 'text-amber-800',
        badgeBorderClass: 'border-amber-200/60',
        badgeTextClass: 'text-amber-900',
        badgeIconClass: 'text-amber-600',
        title: lang === 'hi' ? '2. जिला उद्योग केंद्र (DIC) / NRLM ब्लॉक मिशन' : '2. District Industries Centre (DIC) / NRLM Block Unit',
        role: lang === 'hi' ? 'महिला उद्यमिता सहायता, कौशल प्रशिक्षण व मार्जिन मनी सब्सिडी' : 'Women entrepreneurship, skill development & subsidy clearance',
        action: lang === 'hi' 
          ? 'जिला उद्योग केंद्र (DIC) या ब्लॉक मिशन प्रबंधक (BMMU) से मिलकर स्वयं सहायता समूह (SHG) पंजीकरण व उद्यमिता प्रशिक्षण प्राप्त करें।' 
          : 'Visit the DIC or Block Mission Management Unit (BMMU) to register your SHG enterprise, access EDP training, and claim capital subsidies.',
        badge: lang === 'hi' ? 'उद्यमिता मार्गदर्शन' : 'Entrepreneurship Guidance'
      },
      {
        id: 'live_csc',
        icon: Laptop,
        cardClass: 'bg-blue-50/70 border-blue-200 text-charcoal-800',
        iconBgClass: 'bg-blue-100 text-blue-800',
        titleClass: 'text-blue-950',
        roleClass: 'text-blue-800',
        badgeBorderClass: 'border-blue-200/60',
        badgeTextClass: 'text-blue-900',
        badgeIconClass: 'text-blue-600',
        title: lang === 'hi' ? '3. जन सेवा केंद्र / डिजिटल सेवा केंद्र' : '3. Common Service Center (CSC / Digital Seva)',
        role: lang === 'hi' ? 'उद्यम (Udyam MSME) पंजीकरण व सरकारी पोर्टल आवेदन' : 'Udyam MSME Registration & Online Portal Filing',
        action: lang === 'hi' 
          ? 'मात्र ₹20-50 में उद्यम आधार (MSME) पंजीयन कराएं, जीएसटी/पैन दस्तावेज अपलोड करें और योजना आवेदन जमा कराएं।' 
          : 'Get instant Udyam MSME registration, upload PAN/Bank statements on nodal portals, and download official registration certificates.',
        badge: lang === 'hi' ? 'उद्यम पंजीयन व रसीद' : 'Udyam Registration & Receipt'
      }
    ];
  }

  // Fallback General Touchpoints
  return [
    {
      id: 'gen_panchayat',
      icon: Landmark,
      cardClass: 'bg-rose-50/70 border-rose-200 text-charcoal-800',
      iconBgClass: 'bg-rose-100 text-rose-800',
      titleClass: 'text-rose-950',
      roleClass: 'text-rose-800',
      badgeBorderClass: 'border-rose-200/60',
      badgeTextClass: 'text-rose-900',
      badgeIconClass: 'text-rose-600',
      title: lang === 'hi' ? '1. ग्राम पंचायत भवन / नगर पालिका वार्ड कार्यालय' : '1. Gram Panchayat / Municipal Ward Office',
      role: lang === 'hi' ? 'स्थानीय निवास, आय प्रमाण पत्र सत्यापन व ऑफलाइन आवेदन' : 'Local residence, income verification & physical form submission',
      action: lang === 'hi' 
        ? 'पंचायत सचिव या वार्ड पार्षद से मिलकर स्थानीय पात्रता सत्यापन कराएं और सरकारी योजना का ऑफलाइन फॉर्म जमा करें।' 
        : 'Visit your Panchayat office or Municipal Ward desk to verify residency, check eligibility lists, and submit physical application forms.',
      badge: lang === 'hi' ? '100% निःशुल्क मार्गदर्शन' : '100% Free Guidance'
    },
    {
      id: 'gen_tehsil',
      icon: Building2,
      cardClass: 'bg-emerald-50/70 border-emerald-200 text-charcoal-800',
      iconBgClass: 'bg-emerald-100 text-emerald-800',
      titleClass: 'text-emerald-950',
      roleClass: 'text-emerald-800',
      badgeBorderClass: 'border-emerald-200/60',
      badgeTextClass: 'text-emerald-900',
      badgeIconClass: 'text-emerald-600',
      title: lang === 'hi' ? '2. तहसील / ब्लॉक विकास अधिकारी (BDO Office)' : '2. Tehsil / Block Development Office (BDO)',
      role: lang === 'hi' ? 'सक्षम अधिकारी प्रमाणन, जाति/आय प्रमाण पत्र व नोडल पटल' : 'Competent authority certification, certificates & nodal desk',
      action: lang === 'hi' 
        ? 'तहसीलदार या खंड विकास अधिकारी (BDO) कार्यालय जाकर आवश्यक सरकारी प्रमाण पत्र बनवाएं और योजना की स्वीकृति प्राप्त करें।' 
        : 'Visit the Tehsildar or BDO office to obtain requisite certificates, verify scheme quotas, and get administrative sanctions.',
      badge: lang === 'hi' ? 'प्रमाणन व स्वीकृति' : 'Certification & Sanction'
    },
    {
      id: 'gen_csc',
      icon: Laptop,
      cardClass: 'bg-blue-50/70 border-blue-200 text-charcoal-800',
      iconBgClass: 'bg-blue-100 text-blue-800',
      titleClass: 'text-blue-950',
      roleClass: 'text-blue-800',
      badgeBorderClass: 'border-blue-200/60',
      badgeTextClass: 'text-blue-900',
      badgeIconClass: 'text-blue-600',
      title: lang === 'hi' ? '3. जन सेवा केंद्र / CSC / ई-मित्र (Common Service Center)' : '3. Common Service Center (CSC / e-Mitra)',
      role: lang === 'hi' ? 'सभी ऑनलाइन पोर्टल फॉर्म, आय/जाति/मूल निवास प्रमाण पत्र व बायोमेट्रिक KYC' : 'All central & state online portal submissions, certificates & biometric e-KYC',
      action: lang === 'hi' 
        ? 'मात्र ₹20 से ₹50 के सरकारी शुल्क पर दस्तावेज स्कैन कराएं, फॉर्म भरवाएं और पक्की रसीद (Acknowledgement) प्राप्त करें।' 
        : 'Pay nominal government rates (₹20-50) to get documents scanned, Aadhaar authenticated, forms submitted, and printed acknowledgements.',
      badge: lang === 'hi' ? 'डिजिटल फॉर्म व पक्की रसीद' : 'Portal Upload & Receipt'
    }
  ];
}

export const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t, language: siteLanguage } = useLanguage();

  // Active Tab: 'benefits' | 'eligibility' | 'documents' | 'apply'
  const [activeTab, setActiveTab] = useState<'benefits' | 'eligibility' | 'documents' | 'apply'>('benefits');

  // Scheme Data State
  const [scheme, setScheme] = useState<SchemeMatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bookmark State from Context
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = scheme ? isBookmarked(scheme.scheme_id) : false;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Document Checklist State
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // AI Plain-Language Explanation State
  const passedProfile = (location.state as { profile?: ProfileInput } | undefined)?.profile;
  const storedProfile = useMemo(() => getStoredUserProfile(), []);
  const activeProfile = useMemo(() => {
    return passedProfile || storedProfile || DEFAULT_PROFILE;
  }, [passedProfile, storedProfile]);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);

  // Web Speech Text-to-Speech Controller Hook
  const { speak, stop, isSpeaking, supported: speechSupported } = useSpeech();
  const isSchemeSpeaking = isSpeaking(scheme?.scheme_id);

  // Fetch Scheme Details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getSchemeById(id)
      .then((data) => {
        setScheme(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Scheme not found');
        setLoading(false);
      });
  }, [id]);

  // Auto-fetch plain-language AI summary on scheme load and on language change (Ticket 1.2: AbortController & Language Guard)
  useEffect(() => {
    if (!scheme) return;

    // Reset explanation if language or scheme changed to avoid rendering stale language copy
    if (explanation && (explanation.scheme_id !== scheme.scheme_id || explanation.language !== siteLanguage)) {
      setExplanation(null);
    }

    let cancelled = false;
    const controller = new AbortController();
    setExplainLoading(true);

    explainSchemeEligibility(
      {
        scheme_id: scheme.scheme_id,
        profile: activeProfile,
        language: siteLanguage
      },
      controller.signal
    )
      .then((res) => {
        if (!cancelled && res?.summary && res.language === siteLanguage && res.scheme_id === scheme.scheme_id) {
          setExplanation(res);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && !cancelled) {
          console.warn("Auto-summary fetch fallback applied:", err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setExplainLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [scheme?.scheme_id, siteLanguage, activeProfile]);

  // Localized Fields from Translation Registry
  const displayName = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'name', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayMinistry = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'ministry', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayCategory = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'category', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayBenefits = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'benefits', siteLanguage);
  }, [scheme, siteLanguage]);

  const displayDescription = useMemo(() => {
    if (!scheme) return '';
    return getLocalizedSchemeField(scheme, 'description', siteLanguage);
  }, [scheme, siteLanguage]);

  // Concise, plain-language 3-4 sentence quick summary text (Crisp and complete)
  const displaySummaryText = useMemo(() => {
    if (
      explanation?.summary &&
      explanation.summary.trim().length > 0 &&
      explanation.language === siteLanguage &&
      explanation.scheme_id === scheme?.scheme_id
    ) {
      return formatCrispQuickSummary(explanation.summary, 4, siteLanguage);
    }
    if (!scheme) return '';

    const bestText = displayDescription && displayDescription !== displayBenefits 
      ? displayDescription 
      : displayBenefits;
    return formatCrispQuickSummary(bestText, 4, siteLanguage);
  }, [scheme, displayDescription, displayBenefits, explanation, siteLanguage]);

  // Dynamic Context-Aware Offline Touchpoints (Epic 2: Student, Maternity, Pension, Livelihood, General)
  const offlineTouchpoints = useMemo(() => {
    return scheme ? getOfflineTouchpoints(scheme, siteLanguage) : [];
  }, [scheme, siteLanguage]);

  // Audio Narration Handler (Ticket 3.2: Voice guidance directing to official portal & CSC)
  const handleAudioNarration = () => {
    if (isSchemeSpeaking) {
      stop();
    } else {
      const applyGuidance = scheme?.apply_url
        ? (siteLanguage === 'hi' 
            ? `आवेदन करने के लिए आधिकारिक सरकारी पोर्टल अथवा नजदीकी जन सेवा केंद्र से संपर्क करें।` 
            : `You can apply online via the official government portal or visit your nearest Common Service Centre.`)
        : (siteLanguage === 'hi'
            ? `आवेदन के लिए नजदीकी जन सेवा केंद्र अथवा संबंधित विभाग से संपर्क करें।`
            : `Visit your nearest Common Service Centre or department office to apply.`);

      const textToSpeak = siteLanguage === 'hi'
        ? `${displayName}। ${displayMinistry}। ${displaySummaryText}। ${applyGuidance}`
        : `${displayName}. ${displayMinistry}. ${displaySummaryText}. ${applyGuidance}`;
      speak(textToSpeak, {
        id: scheme?.scheme_id,
        lang: siteLanguage
      });
    }
  };

  // Bookmark Toggle
  const handleBookmarkToggle = async () => {
    if (!scheme) return;
    const newState = await toggleBookmark(scheme);
    const msg = newState ? t('toastBookmarkSaved') : t('toastBookmarkRemoved');
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Interactive Document Checkbox Toggle
  const toggleDocCheck = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const documentsList = useMemo(() => {
    return resolveSchemeDocuments(scheme);
  }, [scheme]);

  const { commonDocsList, specialDocsList } = useMemo(() => {
    const common: string[] = [];
    const special: string[] = [];
    documentsList.forEach((doc) => {
      const info = localizeDocumentName(doc, siteLanguage);
      if (info.isSpecial) {
        special.push(doc);
      } else {
        common.push(doc);
      }
    });
    return { commonDocsList: common, specialDocsList: special };
  }, [documentsList, siteLanguage]);

  const readyDocsCount = useMemo(() => {
    return documentsList.filter((doc) => !!checkedDocs[doc]).length;
  }, [documentsList, checkedDocs]);

  const docProgressPercentage = useMemo(() => {
    if (documentsList.length === 0) return 100;
    return Math.round((readyDocsCount / documentsList.length) * 100);
  }, [documentsList, readyDocsCount]);

  // Localized Snapshot Attributes
  const displayAge = useMemo(() => {
    return formatAgeBounds(scheme?.age_min, scheme?.age_max, siteLanguage);
  }, [scheme?.age_min, scheme?.age_max, siteLanguage]);

  const displayIncome = useMemo(() => {
    return formatIncomeCap(scheme?.income_max, siteLanguage);
  }, [scheme?.income_max, siteLanguage]);

  const displayCaste = useMemo(() => {
    return formatCasteCategories(scheme?.caste_categories, siteLanguage);
  }, [scheme?.caste_categories, siteLanguage]);

  const displayResidence = useMemo(() => {
    return formatResidenceScope(scheme?.residence, siteLanguage);
  }, [scheme?.residence, siteLanguage]);

  const displayGender = useMemo(() => {
    if (!scheme?.gender || scheme.gender.toLowerCase() === 'female') {
      return siteLanguage === 'hi' ? 'केवल महिलाएं (Female)' : 'Female';
    }
    if (scheme.gender.toLowerCase() === 'all') {
      return siteLanguage === 'hi' ? 'सभी नागरिक (All)' : 'All';
    }
    return scheme.gender;
  }, [scheme?.gender, siteLanguage]);

  const isCentral = !scheme?.state || scheme.state.toLowerCase() === 'all' || scheme.state.toLowerCase() === 'all india';

  // Structured localized eligibility points for Tab 2
  const localizedEligibilityPoints = useMemo(() => {
    if (!scheme) return [];
    const minA = scheme.age_min ?? 0;
    const maxA = scheme.age_max ?? 100;
    const isUnconstrainedAge = minA === 0 && maxA >= 100;

    if (siteLanguage === 'hi') {
      const points: string[] = [];
      
      // 1. Age condition
      if (isUnconstrainedAge) {
        points.push('आयु पात्रता: यह योजना सभी आयु वर्ग की पात्र बालिकाओं एवं महिलाओं के लिए खुली है।');
      } else if (minA === 0 && maxA <= 10) {
        points.push(`आयु सीमा: 0 से ${maxA} वर्ष तक की नवजात बालिकाएं एवं छोटी बच्चियां पात्र हैं।`);
      } else if (minA >= 18 && maxA >= 100) {
        points.push('आयु सीमा: 18 वर्ष या उससे अधिक आयु की वयस्क महिलाएं पात्र हैं।');
      } else if (minA >= 60) {
        points.push(`आयु सीमा: ${minA} वर्ष या उससे अधिक आयु की वरिष्ठ नागरिक महिलाएं पात्र हैं।`);
      } else {
        points.push(`आयु सीमा: आवेदक की आयु ${minA} से ${maxA} वर्ष के मध्य होनी चाहिए।`);
      }

      // 2. Gender & Target Group
      if (!scheme.gender || scheme.gender.toLowerCase() === 'female') {
        points.push('लिंग पात्रता: यह योजना विशेष रूप से महिला लाभार्थियों एवं बालिकाओं के कल्याण हेतु समर्पित है।');
      } else {
        points.push('लिंग पात्रता: सभी पात्र नागरिक (महिला व पुरुष) इस योजना के अंतर्गत लाभ ले सकते हैं।');
      }

      // 3. State Residence / Domicile
      if (isCentral) {
        points.push('निवास दायरा: संपूर्ण भारत (सभी 28 राज्यों व 8 केंद्र शासित प्रदेशों) की स्थायी निवासी पात्र हैं।');
      } else {
        points.push(`मूल निवास: आवेदक ${getStateDisplayName(scheme.state, 'hi')} राज्य की स्थायी / मूल निवासी होनी चाहिए।`);
      }

      // 4. Area Scope (Rural/Urban)
      const resLower = (scheme.residence || 'All').trim().toLowerCase();
      if (resLower === 'rural') {
        points.push('क्षेत्रीय दायरा: यह योजना केवल ग्रामीण क्षेत्रों (ग्राम पंचायत / गांव) के निवासियों हेतु है।');
      } else if (resLower === 'urban') {
        points.push('क्षेत्रीय दायरा: यह योजना केवल शहरी स्थानीय निकायों (नगर निगम / नगर पालिका) के निवासियों हेतु है।');
      }

      // 5. Income limit
      if (scheme.income_max && scheme.income_max > 0) {
        points.push(`वार्षिक आय सीमा: परिवार की कुल वार्षिक आय ₹${scheme.income_max.toLocaleString('en-IN')} से कम या बराबर होनी चाहिए।`);
      } else {
        points.push('आय सीमा: इस योजना के लिए कोई अनिवार्य अधिकतम आय सीमा प्रतिबंध नहीं है।');
      }

      // 6. Social Category / Caste
      const casteDisplay = formatCasteCategories(scheme.caste_categories, 'hi');
      if (casteDisplay.includes('केवल')) {
        points.push(`सामाजिक वर्ग: यह योजना विशेष रूप से ${casteDisplay} के आवेदकों के लिए आरक्षित / लक्षित है।`);
      }

      // 7. Priority criteria
      if (scheme.requires_bpl) {
        points.push('आर्थिक प्राथमिकता: बीपीएल (BPL), अंत्योदय (AAY) अथवा आर्थिक रूप से कमजोर वर्ग (EWS) परिवारों को प्राथमिकता दी जाती है।');
      }
      if (scheme.requires_disability) {
        points.push('दिव्यांगता श्रेणी: 40% या अधिक दिव्यांगता (UDID कार्ड धारक) लाभार्थियों के लिए विशेष प्रावधान व प्राथमिकता उपलब्ध है।');
      }

      // Append catalog eligibility text narrative bullet points
      const rawPoints = parseEligibilityPoints(scheme.eligibility_text_hi || scheme.eligibility_text);
      rawPoints.forEach((p) => {
        if (p && p.length > 8 && !points.some((existing) => existing.includes(p.substring(0, 20)))) {
          points.push(p);
        }
      });

      return points;
    }

    // English Language Points
    const points: string[] = [];

    // 1. Age condition
    if (isUnconstrainedAge) {
      points.push('Age Criterion: Open to female beneficiaries across all age groups.');
    } else if (minA === 0 && maxA <= 10) {
      points.push(`Age Limit: Open to newborn baby girls and female children aged 0 to ${maxA} years.`);
    } else if (minA >= 18 && maxA >= 100) {
      points.push('Age Limit: Applicant must be an adult woman aged 18 years and above.');
    } else if (minA >= 60) {
      points.push(`Age Limit: Applicant must be a senior citizen aged ${minA} years and above.`);
    } else {
      points.push(`Age Limit: Applicant must be between ${minA} and ${maxA} years of age.`);
    }

    // 2. Gender & Target Group
    if (!scheme.gender || scheme.gender.toLowerCase() === 'female') {
      points.push('Gender Eligibility: Exclusively dedicated to women beneficiaries and girl children.');
    } else {
      points.push('Gender Eligibility: Open to all eligible citizens (Men & Women).');
    }

    // 3. State Residence / Domicile
    if (isCentral) {
      points.push('Domicile Scope: Resident Indian citizens across all 28 States & 8 Union Territories.');
    } else {
      points.push(`State Domicile: Applicant must be a permanent resident / domicile holder of ${scheme.state}.`);
    }

    // 4. Area Scope (Rural/Urban)
    const resLower = (scheme.residence || 'All').trim().toLowerCase();
    if (resLower === 'rural') {
      points.push('Area Requirement: Strictly restricted to rural areas (Gram Panchayats / Villages).');
    } else if (resLower === 'urban') {
      points.push('Area Requirement: Restricted to urban local body areas (Municipalities / Corporations).');
    }

    // 5. Income limit
    if (scheme.income_max && scheme.income_max > 0) {
      points.push(`Income Ceiling: Total annual family income must not exceed ₹${scheme.income_max.toLocaleString('en-IN')}.`);
    } else {
      points.push('Income Limit: No mandatory maximum family income limit is imposed.');
    }

    // 6. Social Category / Caste
    const casteDisplay = formatCasteCategories(scheme.caste_categories, 'en');
    if (casteDisplay.includes('Only')) {
      points.push(`Social Category: Targeted specifically for ${casteDisplay}.`);
    }

    // 7. Priority criteria
    if (scheme.requires_bpl) {
      points.push('Economic Priority: Prioritizes Below Poverty Line (BPL) / Antyodaya / EWS ration cardholders.');
    }
    if (scheme.requires_disability) {
      points.push('Special Assistance: Benchmark disability of 40%+ (UDID Card) qualifies for targeted benefits.');
    }

    // Append narrative bullet points
    const rawPoints = parseEligibilityPoints(scheme.eligibility_text);
    rawPoints.forEach((p) => {
      if (p && p.length > 8 && !points.some((existing) => existing.toLowerCase().includes(p.substring(0, 20).toLowerCase()))) {
        points.push(p);
      }
    });

    return points;
  }, [scheme, siteLanguage, isCentral]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-cream-200 rounded-md" />
        <div className="bg-white rounded-3xl p-8 border border-cream-200 space-y-6">
          <div className="space-y-3">
            <div className="h-5 w-28 bg-cream-200 rounded-full" />
            <div className="h-8 w-4/5 bg-cream-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-cream-100 rounded-md" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-cream-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-cream-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State: Scheme Not Found
  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-charcoal-900">
            {t('detailSchemeNotFound')}
          </h1>
          <p className="text-sm text-charcoal-600 max-w-md mx-auto">
            {t('detailSchemeNotFoundDesc')}
          </p>
        </div>
        <div>
          <Link
            to="/results"
            className="px-6 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('detailBackToResults')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          role="status"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-charcoal-900 text-white shadow-2xl flex items-center gap-3 border border-saffron-500/40 animate-slideUp max-w-sm"
        >
          <BookmarkCheck className="w-5 h-5 text-saffron-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-charcoal-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div>
        <Link 
          to="/results" 
          state={{ profile: passedProfile }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-saffron-700 hover:text-saffron-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detailBackToResults')}</span>
        </Link>
      </div>

      {/* 1. SCHEME HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-saffron-100 shadow-card space-y-4">
        
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-300 ring-1 ring-forest-200/50 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              <span>{t('badgeEligible')}</span>
            </span>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-800 border border-cream-200">
              {isCentral ? `🏛️ ${t('tagCentral')}` : `📍 ${getStateDisplayName(scheme.state, siteLanguage)} ${t('tagState')}`}
            </span>

            {displayCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-saffron-50 text-saffron-800 border border-saffron-200">
                🌱 {displayCategory}
              </span>
            )}

            {typeof scheme.age_min === 'number' && scheme.age_min < 18 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
                <span>👧</span>
                <span>{t('minorGuardianBadge')}</span>
              </span>
            )}
          </div>



          <div className="flex items-center gap-2">
            {/* Audio Narration Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={handleAudioNarration}
                aria-label={isSchemeSpeaking ? t('ttsStopTooltip') : t('ttsPlayTooltip')}
                title={isSchemeSpeaking ? t('ttsStopTooltip') : t('ttsPlayTooltip')}
                className={`min-h-[48px] px-4 py-2 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs sm:text-sm ${
                  isSchemeSpeaking
                    ? 'bg-saffron-500 text-white border-saffron-600 shadow-md ring-2 ring-saffron-300 animate-pulse'
                    : 'bg-saffron-50/90 hover:bg-saffron-100 text-saffron-800 border-saffron-200 shadow-2xs'
                }`}
              >
                {isSchemeSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{t('ttsStop')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-saffron-700 flex-shrink-0" />
                    <span>{t('ttsListen')}</span>
                  </>
                )}
              </button>
            )}

            {/* Bookmark Toggle Button */}
            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={bookmarked ? t('btnBookmarked') : t('btnBookmark')}
              className={`min-w-[48px] min-h-[48px] p-2.5 rounded-2xl border transition-all flex items-center justify-center ${
                bookmarked 
                  ? 'bg-saffron-100 text-saffron-700 border-saffron-300 shadow-xs' 
                  : 'border-cream-300 text-charcoal-700 hover:bg-cream-100 hover:text-saffron-700'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-saffron-500 text-saffron-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scheme Title & Ministry */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-1.5 flex items-center gap-1.5 font-bold">
            <Building2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
            <span>{displayMinistry}</span>
          </p>
        </div>

        {/* Plain-Language AI Summary Box (Auto-rendered, No User Clicks, Zero Model Jargon) */}
        {explainLoading && (!explanation?.summary || explanation.language !== siteLanguage) ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-saffron-50/70 border border-saffron-200 animate-pulse flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-saffron-600 animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-saffron-900">
              {siteLanguage === 'hi' ? 'सरल भाषा में मुख्य लाभ तैयार हो रहे हैं...' : 'Generating easy-to-read summary...'}
            </span>
          </div>
        ) : displaySummaryText ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-saffron-50/90 via-amber-50/70 to-cream-50 border-2 border-saffron-300 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-saffron-900 font-extrabold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-saffron-600" />
              <span>{siteLanguage === 'hi' ? 'इस योजना का सार (सरल भाषा में)' : 'Scheme Quick Summary'}</span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-medium">
              {displaySummaryText}
            </p>
          </div>
        ) : null}

      </div>

      {/* 2. myScheme 4-TAB NAVIGATION */}
      <div 
        role="tablist"
        aria-label="Scheme Details Navigation"
        className="flex items-center gap-2 border-b border-cream-300 pb-1 overflow-x-auto scrollbar-none scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {[
          { id: 'benefits', label: t('detailTabBenefits'), icon: <Gift className="w-4 h-4" /> },
          { id: 'eligibility', label: t('detailTabEligibility'), icon: <UserCheck className="w-4 h-4" /> },
          { id: 'documents', label: t('detailTabDocuments'), icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'apply', label: t('detailTabHowToApply'), icon: <Globe className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[48px] flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-saffron-500 text-white shadow-md scale-102 ring-2 ring-saffron-500/20'
                  : 'text-charcoal-800 hover:text-charcoal-950 hover:bg-cream-100 bg-white border border-cream-300 font-bold'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT PANELS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card">
        
        {/* ========================================================================= */}
        {/* TAB 1: क्या मिलेगा (BENEFITS) */}
        {/* ========================================================================= */}
        {activeTab === 'benefits' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <Gift className="w-5 h-5 text-forest-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailBenefitsTitle')}
              </h2>
            </div>

            {/* Highlight Benefits Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-forest-50 border border-forest-200/90 text-forest-950 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>{siteLanguage === 'hi' ? 'मुख्य सहायता व वित्तीय लाभ' : 'Key Assistance & Financial Grants'}</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-semibold text-forest-900">
                {displayBenefits}
              </p>
            </div>

            {/* AI Summarized Benefit Highlights */}
            {explanation && explanation.language === siteLanguage && explanation.scheme_id === scheme.scheme_id && explanation.key_benefits && explanation.key_benefits.length > 0 && (
              <div className="space-y-3 pt-1">
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-saffron-600" />
                  <span>{t('aiExplainBenefitsTitle')}:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {explanation.key_benefits.map((benefit, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl bg-cream-50/90 border border-cream-200 flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beneficiary Target Note */}
            {scheme.beneficiary_type && (
              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-center gap-3 text-xs sm:text-sm text-charcoal-700">
                <Tag className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                <span>
                  <strong className="text-charcoal-900">{siteLanguage === 'hi' ? 'लक्षित लाभार्थी:' : 'Target Beneficiaries:'}</strong>{' '}
                  {localizeBeneficiaryType(scheme.beneficiary_type, siteLanguage)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: कौन पात्र है (ELIGIBILITY) */}
        {/* ========================================================================= */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
              <UserCheck className="w-5 h-5 text-saffron-600 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                {t('detailEligibilityTitle')}
              </h2>
            </div>

            {/* Snapshot 4-Grid Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailAgeLimit')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm" title={displayAge}>
                  {displayAge}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <IndianRupee className="w-3.5 h-3.5 text-forest-600" />
                  <span>{t('detailIncomeLimit')}</span>
                </div>
                <div className="font-bold text-forest-700 text-sm" title={displayIncome}>
                  {displayIncome}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <Tag className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailCaste')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm line-clamp-1" title={displayCaste}>
                  {displayCaste}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50/90 border border-cream-200 space-y-1">
                <div className="flex items-center gap-1.5 text-charcoal-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                  <span>{t('detailResidence')}</span>
                </div>
                <div className="font-bold text-charcoal-900 text-sm" title={displayResidence}>
                  {displayResidence}
                </div>
              </div>
            </div>

            {/* Special Eligibility Priority Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isCentral ? (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>{siteLanguage === 'hi' ? 'अखिल भारतीय योजना (Central)' : 'All India Scheme (Central)'}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{siteLanguage === 'hi' ? `${getStateDisplayName(scheme.state, 'hi')} राज्य योजना` : `${scheme.state} State Scheme`}</span>
                </span>
              )}
              {scheme.requires_bpl && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{siteLanguage === 'hi' ? 'बीपीएल / अंत्योदय प्राथमिकता' : 'BPL / Antyodaya Priority'}</span>
                </span>
              )}
              {scheme.requires_disability && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>{siteLanguage === 'hi' ? 'दिव्यांग (PwD) सहायता' : 'PwD Priority'}</span>
                </span>
              )}
              {scheme.gender && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cream-100 text-charcoal-800 border border-cream-300">
                  {siteLanguage === 'hi' ? 'लिंग:' : 'Gender:'} {displayGender}
                </span>
              )}
            </div>

            {/* Structured Criteria Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 uppercase tracking-wide">
                {siteLanguage === 'hi' ? 'विस्तृत पात्रता विवरण:' : 'Detailed Eligibility Criteria:'}
              </h3>
              <div className="space-y-2.5">
                {localizedEligibilityPoints.map((point, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200 flex items-start gap-3 text-xs sm:text-sm text-charcoal-800 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: जरूरी कागजात (DOCUMENTS CHECKLIST) */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                  {t('detailDocumentsTitle')}
                </h2>
              </div>
              
              {documentsList.length > 0 && (
                <span className={`text-xs font-bold px-3.5 py-1 rounded-full border transition-all ${
                  readyDocsCount === documentsList.length
                    ? 'bg-forest-100 text-forest-900 border-forest-300'
                    : 'bg-saffron-50 text-saffron-900 border-saffron-200'
                }`}>
                  {readyDocsCount} / {documentsList.length} {t('detailDocReady')} ({docProgressPercentage}%)
                </span>
              )}
            </div>

            {/* Live Document Preparation Progress Bar */}
            {documentsList.length > 0 && (
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      docProgressPercentage === 100 ? 'bg-forest-500' : 'bg-saffron-500'
                    }`}
                    style={{ width: `${docProgressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal-600">
                  {docProgressPercentage === 100 
                    ? t('detailDocsAllReady') 
                    : t('detailDocsChecklistHelp')}
                </p>
              </div>
            )}

            {/* Categorized Document Checklist Items */}
            {documentsList.length > 0 ? (
              <div className="space-y-6">
                {/* 1. Common Documents Section */}
                {commonDocsList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-cream-200/80 pb-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-charcoal-900 flex items-center gap-1.5">
                          <span>📁</span>
                          <span>{t('docCategoryCommon')}</span>
                        </h3>
                        <p className="text-[11px] sm:text-xs text-charcoal-500 mt-0.5">
                          {t('docCategoryCommonDesc')}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded-full">
                        {commonDocsList.filter((d) => !!checkedDocs[d]).length} / {commonDocsList.length} {t('detailDocReady')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {commonDocsList.map((doc, idx) => {
                        const isChecked = !!checkedDocs[doc];
                        const docInfo = localizeDocumentName(doc, siteLanguage);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDocCheck(doc)}
                            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                              isChecked
                                ? 'bg-forest-50/90 border-forest-300 text-forest-950 font-semibold shadow-2xs ring-1 ring-forest-300/50'
                                : 'bg-white border-cream-300 text-charcoal-700 hover:bg-cream-50 hover:border-cream-400'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1 flex-1">
                              <span className="text-xs sm:text-sm leading-snug block font-bold text-charcoal-900">
                                {docInfo.name}
                              </span>
                              {docInfo.hint && (
                                <span className="text-[11px] text-charcoal-600 block leading-tight">
                                  💡 {docInfo.hint}
                                </span>
                              )}
                              {docInfo.authority && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-charcoal-600 bg-cream-100/90 border border-cream-300 px-2 py-0.5 rounded-md mt-1">
                                  🏛️ {docInfo.authority}
                                </span>
                              )}
                              <span className="text-[10px] text-charcoal-500 block pt-0.5">
                                {isChecked ? `✓ ${t('detailDocReady')}` : `○ ${t('detailDocPending')}`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Special Certificates Section */}
                {specialDocsList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-2 border-b border-cream-200/80 pb-2">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-charcoal-900 flex items-center gap-1.5">
                          <span>📜</span>
                          <span>{t('docCategorySpecial')}</span>
                        </h3>
                        <p className="text-[11px] sm:text-xs text-charcoal-500 mt-0.5">
                          {t('docCategorySpecialDesc')}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {specialDocsList.filter((d) => !!checkedDocs[d]).length} / {specialDocsList.length} {t('detailDocReady')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {specialDocsList.map((doc, idx) => {
                        const isChecked = !!checkedDocs[doc];
                        const docInfo = localizeDocumentName(doc, siteLanguage);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDocCheck(doc)}
                            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                              isChecked
                                ? 'bg-forest-50/90 border-forest-300 text-forest-950 font-semibold shadow-2xs ring-1 ring-forest-300/50'
                                : 'bg-white border-cream-300 text-charcoal-700 hover:bg-cream-50 hover:border-cream-400'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1 flex-1">
                              <span className="text-xs sm:text-sm leading-snug block font-bold text-charcoal-900">
                                {docInfo.name}
                              </span>
                              {docInfo.hint && (
                                <span className="text-[11px] text-charcoal-600 block leading-tight">
                                  💡 {docInfo.hint}
                                </span>
                              )}
                              {docInfo.authority && (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-950 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-md mt-1">
                                  🏛️ {docInfo.authority}
                                </span>
                              )}
                              <span className="text-[10px] text-charcoal-500 block pt-0.5">
                                {isChecked ? `✓ ${t('detailDocReady')}` : `○ ${t('detailDocPending')}`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center gap-3 text-xs sm:text-sm text-charcoal-600">
                <FileText className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                <span>
                  {siteLanguage === 'hi' 
                    ? 'सामान्य पहचान पत्र (आधार कार्ड / वोटर आईडी / बैंक पासबुक / निवास प्रमाण पत्र) साथ रखें।' 
                    : 'Standard identity and residence documents (Aadhaar, Voter ID, Bank Passbook) required.'}
                </span>
              </div>
            )}

            {/* Helpful advice for obtaining missing certificates */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{t('detailDocsMissingTip')}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: आवेदन कैसे करें (HOW TO APPLY) */}
        {/* ========================================================================= */}
        {activeTab === 'apply' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
                  {t('detailApplicationProcessTitle')}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('detailGovtVerifiedBadge')}</span>
              </span>
            </div>

            {/* ========================================================================= */}
            {/* 1. STREAMLINED ONLINE APPLICATION PORTAL CARD                             */}
            {/* ========================================================================= */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-saffron-50/60 via-white to-amber-50/40 border border-saffron-200/90 p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-charcoal-900">
                        {t('detailOnlineModeTab')}
                      </span>
                      {scheme.apply_url && (
                        <span className="font-mono text-[11px] text-charcoal-500 bg-cream-100 border border-cream-200 px-2 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{new URL(scheme.apply_url).hostname}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('detailGovtVerifiedBadge')}</span>
                    </span>
                  </div>
                </div>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {scheme.apply_url && (
                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 sm:px-6 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-600 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2 group cursor-pointer"
                      title={scheme.apply_url}
                    >
                      <span>{t('detailApplyDirectOnlineBtn')}</span>
                      <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  )}

                  {scheme.official_url && scheme.official_url !== scheme.apply_url && (
                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl border border-cream-300 bg-white hover:bg-cream-100/80 text-charcoal-700 font-semibold text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-2"
                      title={scheme.official_url}
                    >
                      <span>{t('detailVisitDeptWebsiteBtn')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
                    </a>
                  )}

                  {/* PDF Form Download if detected in process text */}
                  {scheme.application_process && scheme.application_process.toLowerCase().includes('.pdf') && (
                    <a
                      href={
                        (extractUrls(scheme.application_process).find((u) => u.isPdf)?.url) ||
                        scheme.apply_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-4 h-4 text-rose-600" />
                      <span>{t('detailDownloadFormPdf')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. OFFICIAL APPLICATION INSTRUCTIONS & HYPERLINKED STEPS                  */}
            {/* ========================================================================= */}
            {(scheme.application_process || scheme.application_process_hi) && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-cream-50/80 via-white to-amber-50/30 border border-cream-200 text-xs sm:text-sm text-charcoal-800 leading-relaxed space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-charcoal-900 text-sm sm:text-base">
                        {t('detailOfficialGuidelinesTitle')}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-charcoal-500">
                        {t('detailOfficialGuidelinesSubtitle')}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('detailGovtVerifiedBadge')}</span>
                  </span>
                </div>
                <FormattedApplicationText 
                  text={getLocalizedSchemeField(scheme, 'application_process', siteLanguage)} 
                  language={siteLanguage}
                  applyUrl={scheme.apply_url}
                  officialUrl={scheme.official_url}
                />
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. OFFLINE ASSISTANCE MODULE: गांव / वार्ड में कहां से आवेदन करें?          */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-4 border-t border-cream-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-saffron-600 flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-charcoal-900">
                    {t('offlineHelpTitle')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-600">
                  {t('offlineHelpSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {offlineTouchpoints.map((point) => {
                  const IconComp = point.icon;
                  return (
                    <div 
                      key={point.id}
                      className={`p-4 sm:p-5 rounded-2xl border ${point.cardClass} space-y-3 flex flex-col justify-between shadow-2xs`}
                    >
                      <div className="space-y-2">
                        <div className={`w-10 h-10 rounded-xl ${point.iconBgClass} flex items-center justify-center font-bold`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs sm:text-sm leading-snug ${point.titleClass}`}>
                            {point.title}
                          </h4>
                          <span className={`text-[11px] font-semibold block mt-0.5 ${point.roleClass}`}>
                            {point.role}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-700 leading-relaxed font-medium">
                          {point.action}
                        </p>
                      </div>
                      <div className={`pt-2 border-t ${point.badgeBorderClass} flex items-center gap-1.5 text-[11px] font-bold ${point.badgeTextClass}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${point.badgeIconClass} flex-shrink-0`} />
                        <span>{point.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default SchemeDetail;


