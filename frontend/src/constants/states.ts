/**
 * Standard list of 28 States and 8 Union Territories of India with bilingual Hindi & English names.
 * Used across the Eligibility Wizard and Results Catalog Filters.
 */

export interface StateItem {
  id: string;
  value: string; // Canonical English identifier for database and API matching
  labelEn: string;
  labelHi: string;
  isUnionTerritory: boolean;
}

export const INDIAN_STATES_DATA: readonly StateItem[] = [
  // 28 States
  { id: "AP", value: "Andhra Pradesh", labelEn: "Andhra Pradesh", labelHi: "आंध्र प्रदेश", isUnionTerritory: false },
  { id: "AR", value: "Arunachal Pradesh", labelEn: "Arunachal Pradesh", labelHi: "अरुणाचल प्रदेश", isUnionTerritory: false },
  { id: "AS", value: "Assam", labelEn: "Assam", labelHi: "असम", isUnionTerritory: false },
  { id: "BR", value: "Bihar", labelEn: "Bihar", labelHi: "बिहार", isUnionTerritory: false },
  { id: "CG", value: "Chhattisgarh", labelEn: "Chhattisgarh", labelHi: "छत्तीसगढ़", isUnionTerritory: false },
  { id: "GA", value: "Goa", labelEn: "Goa", labelHi: "गोवा", isUnionTerritory: false },
  { id: "GJ", value: "Gujarat", labelEn: "Gujarat", labelHi: "गुजरात", isUnionTerritory: false },
  { id: "HR", value: "Haryana", labelEn: "Haryana", labelHi: "हरियाणा", isUnionTerritory: false },
  { id: "HP", value: "Himachal Pradesh", labelEn: "Himachal Pradesh", labelHi: "हिमाचल प्रदेश", isUnionTerritory: false },
  { id: "JH", value: "Jharkhand", labelEn: "Jharkhand", labelHi: "झारखंड", isUnionTerritory: false },
  { id: "KA", value: "Karnataka", labelEn: "Karnataka", labelHi: "कर्नाटक", isUnionTerritory: false },
  { id: "KL", value: "Kerala", labelEn: "Kerala", labelHi: "केरल", isUnionTerritory: false },
  { id: "MP", value: "Madhya Pradesh", labelEn: "Madhya Pradesh", labelHi: "मध्य प्रदेश", isUnionTerritory: false },
  { id: "MH", value: "Maharashtra", labelEn: "Maharashtra", labelHi: "महाराष्ट्र", isUnionTerritory: false },
  { id: "MN", value: "Manipur", labelEn: "Manipur", labelHi: "मणिपुर", isUnionTerritory: false },
  { id: "ML", value: "Meghalaya", labelEn: "Meghalaya", labelHi: "मेघालय", isUnionTerritory: false },
  { id: "MZ", value: "Mizoram", labelEn: "Mizoram", labelHi: "मिज़ोरम", isUnionTerritory: false },
  { id: "NL", value: "Nagaland", labelEn: "Nagaland", labelHi: "नागालैंड", isUnionTerritory: false },
  { id: "OD", value: "Odisha", labelEn: "Odisha", labelHi: "ओडिशा", isUnionTerritory: false },
  { id: "PB", value: "Punjab", labelEn: "Punjab", labelHi: "पंजाब", isUnionTerritory: false },
  { id: "RJ", value: "Rajasthan", labelEn: "Rajasthan", labelHi: "राजस्थान", isUnionTerritory: false },
  { id: "SK", value: "Sikkim", labelEn: "Sikkim", labelHi: "सिक्किम", isUnionTerritory: false },
  { id: "TN", value: "Tamil Nadu", labelEn: "Tamil Nadu", labelHi: "तमिलनाडु", isUnionTerritory: false },
  { id: "TS", value: "Telangana", labelEn: "Telangana", labelHi: "तेलंगाना", isUnionTerritory: false },
  { id: "TR", value: "Tripura", labelEn: "Tripura", labelHi: "त्रिपुरा", isUnionTerritory: false },
  { id: "UP", value: "Uttar Pradesh", labelEn: "Uttar Pradesh", labelHi: "उत्तर प्रदेश", isUnionTerritory: false },
  { id: "UK", value: "Uttarakhand", labelEn: "Uttarakhand", labelHi: "उत्तराखंड", isUnionTerritory: false },
  { id: "WB", value: "West Bengal", labelEn: "West Bengal", labelHi: "पश्चिम बंगाल", isUnionTerritory: false },

  // 8 Union Territories
  { id: "AN", value: "Andaman and Nicobar Islands", labelEn: "Andaman and Nicobar Islands", labelHi: "अंडमान और निकोबार द्वीप समूह", isUnionTerritory: true },
  { id: "CH", value: "Chandigarh", labelEn: "Chandigarh", labelHi: "चंडीगढ़", isUnionTerritory: true },
  { id: "DH", value: "Dadra and Nagar Haveli and Daman and Diu", labelEn: "Dadra and Nagar Haveli and Daman and Diu", labelHi: "दादरा और नगर हवेली एवं दमन और दीव", isUnionTerritory: true },
  { id: "DL", value: "Delhi", labelEn: "Delhi (NCT)", labelHi: "दिल्ली (राष्ट्रीय राजधानी क्षेत्र)", isUnionTerritory: true },
  { id: "JK", value: "Jammu and Kashmir", labelEn: "Jammu and Kashmir", labelHi: "जम्मू और कश्मीर", isUnionTerritory: true },
  { id: "LA", value: "Ladakh", labelEn: "Ladakh", labelHi: "लद्दाख", isUnionTerritory: true },
  { id: "LD", value: "Lakshadweep", labelEn: "Lakshadweep", labelHi: "लक्षद्वीप", isUnionTerritory: true },
  { id: "PY", value: "Puducherry", labelEn: "Puducherry", labelHi: "पुदुचेरी", isUnionTerritory: true }
];

export const STATES_ONLY_DATA: readonly StateItem[] = INDIAN_STATES_DATA.filter((s) => !s.isUnionTerritory);
export const UNION_TERRITORIES_DATA: readonly StateItem[] = INDIAN_STATES_DATA.filter((s) => s.isUnionTerritory);

export const INDIAN_STATES: readonly string[] = INDIAN_STATES_DATA.map((s) => s.value);
export const UNION_TERRITORIES: readonly string[] = UNION_TERRITORIES_DATA.map((s) => s.value);

export const ALL_INDIA_OPTION = "All India";

/**
 * Returns localized name for a state or UT given its canonical English name or ID.
 */
export const getStateDisplayName = (stateValue: string, lang: 'en' | 'hi' = 'en'): string => {
  if (!stateValue) return '';
  const match = INDIAN_STATES_DATA.find(
    (s) => s.value.toLowerCase() === stateValue.trim().toLowerCase() || s.id.toLowerCase() === stateValue.trim().toLowerCase()
  );
  if (!match) return stateValue;
  return lang === 'hi' ? match.labelHi : match.labelEn;
};
