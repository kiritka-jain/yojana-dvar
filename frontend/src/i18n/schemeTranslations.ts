/**
 * Comprehensive Scheme Translation Registry for Yojana Dvar (Ticket YD-I18N-3.1)
 * ==============================================================================
 * Provides curated, zero-latency, culturally resonant Hindi translations for all
 * catalog schemes (titles, ministries, plain-language benefit summaries, and categories).
 */

export interface SchemeTranslation {
  name_hi: string;
  ministry_hi: string;
  category_hi: string;
  benefits_hi: string;
  description_hi?: string;
  application_process_hi?: string;
  documents_required_hi?: string;
  eligibility_text_hi?: string;
}

export const SCHEME_TRANSLATIONS: Record<string, SchemeTranslation> = {
  // 1. Delhi Free DTC Bus Travel Scheme
  'delhi-free-dtc-bus-travel-scheme': {
    name_hi: 'दिल्ली फ्री डीटीसी बस यात्रा योजना (पिंक पास)',
    ministry_hi: 'दिल्ली सरकार (परिवहन विभाग)',
    category_hi: 'यात्रा व परिवहन',
    benefits_hi: 'डीटीसी और क्लस्टर बसों में महिलाओं के लिए 100% मुफ्त यात्रा हेतु पिंक पास।',
    description_hi: 'दिल्ली में सभी महिलाओं और बालिकाओं के लिए सार्वजनिक बसों में सुरक्षित और निशुल्क यात्रा।'
  },

  // 2. Gaura Devi Kanya Dhan Yojana
  'gaura-devi-kanya-dhan-yojana': {
    name_hi: 'गौरा देवी कन्या धन योजना (उत्तराखंड)',
    ministry_hi: 'उत्तराखंड सरकार (महिला सशक्तिकरण एवं बाल विकास विभाग)',
    category_hi: 'शिक्षा व छात्रवृत्ति',
    benefits_hi: '12वीं कक्षा उत्तीर्ण करने पर ₹51,000 की एकमुश्त सावधि जमा (FD) सहायता राशि।',
    description_hi: 'ग्रामीण व निर्धन परिवारों की छात्राओं को 12वीं के बाद उच्च शिक्षा हेतु आर्थिक संबल।'
  },

  // 3. Griha Aadhar Scheme
  'griha-aadhar-scheme': {
    name_hi: 'गृह आधार योजना (गोवा)',
    ministry_hi: 'गोवा सरकार (महिला एवं बाल विकास निदेशालय)',
    category_hi: 'सामाजिक कल्याण व सशक्तिकरण',
    benefits_hi: 'गृहणियों को घरेलू खर्च व महंगाई राहत हेतु ₹1,500 प्रतिमाह सीधे बैंक खाते में।',
    description_hi: 'मध्यम एवं निम्न आय वर्ग की गृहणियों को आर्थिक रूप से सशक्त बनाने हेतु मासिक सहायता।'
  },

  // 4. Gruha Lakshmi Scheme
  'gruha-lakshmi-scheme': {
    name_hi: 'गृह लक्ष्मी योजना (कर्नाटक)',
    ministry_hi: 'कर्नाटक सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'सामाजिक कल्याण व सशक्तिकरण',
    benefits_hi: 'परिवार की महिला मुखिया को ₹2,000 प्रतिमाह प्रत्यक्ष डीबीटी बैंक अंतरण।',
    description_hi: 'कर्नाटक में महिलाओं के आर्थिक स्वावलंबन और पोषण सुधार हेतु ₹2,000 की मासिक सहायता।'
  },

  // 5. Indira Gandhi National Widow Pension Scheme
  'indira-gandhi-national-widow-pension-scheme': {
    name_hi: 'इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना (IGNWPS)',
    ministry_hi: 'ग्रामीण विकास मंत्रालय (भारत सरकार)',
    category_hi: 'पेंशन व सामाजिक सुरक्षा',
    benefits_hi: '40-79 वर्ष की बीपीएल विधवा महिलाओं को ₹300 से ₹1,500 प्रतिमाह तक पेंशन।',
    description_hi: 'गरीबी रेखा से नीचे जीवनयापन करने वाली विधवा महिलाओं को जीवन निर्वाह पेंशन।'
  },

  // 6. Kanya Sumangala / Mukhyamantri Kanya Vivah Yojana
  'kanya-sumangala-mukhyamantri-kanya-vivah-yojana': {
    name_hi: 'मुख्यमंत्री कन्या विवाह योजना (छत्तीसगढ़)',
    ministry_hi: 'छत्तीसगढ़ सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'सामाजिक कल्याण व विवाह सहायता',
    benefits_hi: 'कन्या के विवाह हेतु ₹50,000 की कुल आर्थिक सहायता (₹20,000 बैंक खाते में + उपहार व व्यवस्था)।',
    description_hi: 'निर्धन एवं जरूरतमंद परिवारों की कन्याओं के विवाह खर्च में सरकारी आर्थिक मदद।'
  },

  // 7. Kanyashree Prakalpa
  'kanyashree-prakalpa': {
    name_hi: 'कन्याश्री प्रकल्प (पश्चिम बंगाल)',
    ministry_hi: 'पश्चिम बंगाल सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'शिक्षा व छात्रवृत्ति',
    benefits_hi: 'कक्षा 8-12 की छात्राओं को ₹1,000 वार्षिक छात्रवृत्ति तथा 18 वर्ष पूर्ण होने पर ₹25,000 का एकमुश्त अनुदान।',
    description_hi: 'बाल विवाह रोकथाम और बालिकाओं को उच्चतर शिक्षा से जोड़ने हेतु प्रोत्साहन योजना।'
  },

  // 8. Kudumbashree Women Empowerment & Livelihood Mission
  'kudumbashree-women-empowerment-livelihood-mission': {
    name_hi: 'कुदुम्बश्री महिला सशक्तिकरण एवं आजीविका मिशन',
    ministry_hi: 'केरल सरकार (स्थानीय स्वशासन विभाग)',
    category_hi: 'स्वरोजगार व आजीविका',
    benefits_hi: 'कम ब्याज पर सूक्ष्म ऋण, व्यावसायिक कौशल प्रशिक्षण और आजीविका उद्यम सहायता।',
    description_hi: 'स्वयं सहायता समूहों के माध्यम से महिलाओं को उद्यमी व आत्मनिर्भर बनाने का अभियान।'
  },

  // 9. Mahalakshmi Scheme
  'mahalakshmi-scheme': {
    name_hi: 'महालक्ष्मी योजना (तेलंगाना)',
    ministry_hi: 'तेलंगाना सरकार',
    category_hi: 'यात्रा व घरेलू सहायता',
    benefits_hi: 'आरटीसी बसों में मुफ्त यात्रा, ₹2,500 प्रतिमाह वित्तीय सहायता और ₹500 में एलपीजी गैस सिलेंडर।',
    description_hi: 'तेलंगाना की महिलाओं के कल्याण, निर्बाध यात्रा और घरेलू ऊर्जा सुरक्षा हेतु व्यापक योजना।'
  },

  // 10. Mahila Samman Savings Certificate
  'mahila-samman-savings-certificate': {
    name_hi: 'महिला सम्मान बचत पत्र (MSSC)',
    ministry_hi: 'डाक विभाग / वित्त मंत्रालय (भारत सरकार)',
    category_hi: 'बैंकिंग व बचत योजना',
    benefits_hi: '7.5% की आकर्षक निश्चित ब्याज दर (त्रैमासिक चक्रवृद्धि), ₹2 लाख तक जमा सुविधा।',
    description_hi: 'महिलाओं और बालिकाओं के नाम पर सुरक्षित लघु बचत प्रोत्साहन योजना।'
  },

  // 11. Maiya Samman Yojana
  'maiya-samman-yojana': {
    name_hi: 'मंईयां सम्मान योजना (झारखंड)',
    ministry_hi: 'झारखंड सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'सामाजिक कल्याण व सशक्तिकरण',
    benefits_hi: '18 से 50 वर्ष की महिलाओं को ₹1,000 प्रतिमाह (₹12,000 वार्षिक) डीबीटी बैंक अंतरण।',
    description_hi: 'झारखंड की बहनों के पोषण, स्वास्थ्य और आत्मनिर्भरता हेतु मासिक आर्थिक संबल।'
  },

  // 12. Mission Shakti - Odisha
  'mission-shakti-odisha': {
    name_hi: 'मिशन शक्ति (ओडिशा)',
    ministry_hi: 'ओडिशा सरकार (मिशन शक्ति विभाग)',
    category_hi: 'व्यवसाय व महिला उद्यमिता',
    benefits_hi: '₹5 लाख तक 0% ब्याज मुक्त व्यवसाय ऋण तथा एसएचजी समूहों को रिवाल्विंग फंड।',
    description_hi: 'महिला स्वयं सहायता समूहों को वित्तीय सहायता देकर स्वावलंबी उद्यमी बनाने की पहल।'
  },

  // 13. Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme
  'moovalur-ramamirtham-ammaiyar-higher-education-assurance-scheme': {
    name_hi: 'मूवलूर रामामिरथम अम्माय्यर उच्च शिक्षा योजना (पुधुमई पेन)',
    ministry_hi: 'तमिलनाडु सरकार (सामाजिक कल्याण विभाग)',
    category_hi: 'शिक्षा व छात्रवृत्ति',
    benefits_hi: 'सरकारी स्कूल से पास छात्राओं को कॉलेज/डिग्री पूरी होने तक ₹1,000 प्रतिमाह सीधे बैंक खाते में।',
    description_hi: 'लड़कियों के कॉलेज नामांकन और उच्च तकनीकी शिक्षा को बढ़ावा देने हेतु मासिक छात्रवृत्ति।'
  },

  // 14. Mukhya Mantri Kanya Sumangala Yojana
  'mukhya-mantri-kanya-sumangala-yojana': {
    name_hi: 'मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश)',
    ministry_hi: 'उत्तर प्रदेश सरकार (महिला कल्याण विभाग)',
    category_hi: 'शिक्षा व बालिका कल्याण',
    benefits_hi: 'जन्म से लेकर स्नातक तक 6 चरणों में कुल ₹25,000 की वित्तीय सहायता।',
    description_hi: 'बालिकाओं के जन्म, टीकाकरण, स्कूल व कॉलेज की पढ़ाई हेतु चरणबद्ध वित्तीय अनुदान।'
  },

  // 15. Mukhyamantri Chiranjeevi Swasthya Bima Yojana
  'mukhyamantri-chiranjeevi-swasthya-bima-yojana': {
    name_hi: 'मुख्यमंत्री चिरंजीवी स्वास्थ्य बीमा योजना (राजस्थान)',
    ministry_hi: 'राजस्थान सरकार (चिकित्सा एवं स्वास्थ्य विभाग)',
    category_hi: 'स्वास्थ्य व चिकित्सा सुरक्षा',
    benefits_hi: 'प्रति परिवार ₹25 लाख तक का कैशलेस इलाज एवं अस्पताल में निःशुल्क चिकित्सा सुविधा।',
    description_hi: 'गंभीर बीमारियों और मातृत्व देखभाल सहित परिवार के संपूर्ण स्वास्थ्य का कैशलेस सुरक्षा कवच।'
  },

  // 16. Mukhyamantri Kanya Utthan Yojana
  'mukhyamantri-kanya-utthan-yojana': {
    name_hi: 'मुख्यमंत्री कन्या उत्थान योजना (बिहार)',
    ministry_hi: 'बिहार सरकार (शिक्षा एवं समाज कल्याण विभाग)',
    category_hi: 'शिक्षा व प्रोत्साहन अनुदान',
    benefits_hi: 'स्नातक (ग्रेजुएशन) उत्तीर्ण करने पर ₹50,000 तथा 12वीं उत्तीर्ण करने पर ₹25,000 का सीधा अनुदान।',
    description_hi: 'बिहार की बालिकाओं को उच्च शिक्षा प्राप्त करने और आत्मनिर्भर बनने हेतु वित्तीय प्रोत्साहन।'
  },

  // 17. Mukhyamantri Ladli Behna Yojana
  'mukhyamantri-ladli-behna-yojana': {
    name_hi: 'मुख्यमंत्री लाडली बहना योजना (मध्य प्रदेश)',
    ministry_hi: 'मध्य प्रदेश सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'सामाजिक कल्याण व सशक्तिकरण',
    benefits_hi: 'पात्र महिलाओं को ₹1,250 प्रतिमाह (₹15,000 वार्षिक) हर माह की 10 तारीख को बैंक खाते में।',
    description_hi: 'मध्य प्रदेश की बहनों के स्वास्थ्य, पोषण और आर्थिक स्वावलंबन हेतु प्रत्यक्ष आर्थिक सहायता।'
  },

  // 18. Mukhyamantri Mahila Samman Yojana
  'mukhyamantri-mahila-samman-yojana': {
    name_hi: 'मुख्यमंत्री महिला सम्मान योजना (हिमाचल प्रदेश)',
    ministry_hi: 'हिमाचल प्रदेश सरकार (सामाजिक न्याय एवं अधिकारिता विभाग)',
    category_hi: 'सामाजिक कल्याण व सम्मान निधि',
    benefits_hi: '18 वर्ष से अधिक आयु की सभी पात्र महिलाओं को ₹1,500 प्रतिमाह सीधे बैंक खाते में।',
    description_hi: 'हिमाचल प्रदेश की महिलाओं के सम्मान और आत्मनिर्भरता हेतु मासिक वित्तीय भत्ता।'
  },

  // 19. Mukhyamantri Mahila Utkarsh Yojana
  'mukhyamantri-mahila-utkarsh-yojana': {
    name_hi: 'मुख्यमंत्री महिला उत्कर्ष योजना (गुजरात)',
    ministry_hi: 'गुजरात सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'व्यवसाय व स्वरोजगार',
    benefits_hi: '10 महिलाओं के समूह को ₹1 लाख तक का 0% ब्याज मुक्त ऋण (ब्याज सरकार वहन करती है)।',
    description_hi: 'शहरी एवं ग्रामीण महिला समूहों को बिना किसी ब्याज के व्यवसाय शुरू करने हेतु ऋण।'
  },

  // 20. Mukhyamantri Majhi Ladki Bahin Yojana
  'mukhyamantri-majhi-ladki-bahin-yojana': {
    name_hi: 'मुख्यमंत्री माझी लाड़की बहिन योजना (महाराष्ट्र)',
    ministry_hi: 'महाराष्ट्र सरकार (महिला एवं बाल विकास विभाग)',
    category_hi: 'सामाजिक कल्याण व सशक्तिकरण',
    benefits_hi: '21 से 65 वर्ष की पात्र महिलाओं को ₹1,500 प्रतिमाह सीधे आधार लिंक बैंक खाते में।',
    description_hi: 'महाराष्ट्र की महिलाओं के आर्थिक सशक्तिकरण और पोषण सुधार हेतु मासिक नकद अंतरण।'
  },

  // 21. Orunodoi 2.0 Scheme
  'orunodoi-20-scheme': {
    name_hi: 'ओरुनोदोई 2.0 योजना (असम)',
    ministry_hi: 'असम सरकार (वित्त विभाग)',
    category_hi: 'सामाजिक कल्याण व पोषण सहायता',
    benefits_hi: 'परिवार की महिला मुखिया को ₹1,250 प्रतिमाह दवा, पोषण और घरेलू जरूरतों हेतु डीबीटी अनुदान।',
    description_hi: 'असम के निर्धन परिवारों की महिलाओं के पोषण व स्वास्थ्य सुरक्षा हेतु सबसे बड़ी डीबीटी योजना।'
  },

  // 22. PM Street Vendor's AtmaNirbhar Nidhi
  'pm-street-vendors-atmanirbhar-nidhi': {
    name_hi: 'पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)',
    ministry_hi: 'आवासन और शहरी कार्य मंत्रालय (भारत सरकार)',
    category_hi: 'व्यवसाय व सूक्ष्म ऋण',
    benefits_hi: 'बिना किसी गारंटी के ₹10,000, ₹20,000 व ₹50,000 तक का कार्यशील पूंजी ऋण व ब्याज सब्सिडी।',
    description_hi: 'रेहड़ी-पटरी एवं छोटे व्यवसाय करने वाली महिलाओं को कम ब्याज पर आसान ऋण सुविधा।'
  },

  // 23. Post Graduate Indira Gandhi Scholarship for Single Girl Child
  'post-graduate-indira-gandhi-scholarship-for-single-girl-child': {
    name_hi: 'एकल बालिका हेतु स्नातकोत्तर इंदिरा गांधी छात्रवृत्ति',
    ministry_hi: 'विश्वविद्यालय अनुदान आयोग (UGC) / शिक्षा मंत्रालय',
    category_hi: 'उच्च शिक्षा व छात्रवृत्ति',
    benefits_hi: 'पीजी (मास्टर्स) डिग्री के दौरान ₹36,200 वार्षिक (₹3,100 प्रतिमाह) छात्रवृत्ति 2 वर्षों तक।',
    description_hi: 'परिवार की इकलौती बेटी को उच्च स्नातकोत्तर शिक्षा जारी रखने हेतु विशेष राष्ट्रीय छात्रवृत्ति।'
  },

  // 24. Pradhan Mantri Matru Vandana Yojana
  'pradhan-mantri-matru-vandana-yojana': {
    name_hi: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY)',
    ministry_hi: 'महिला एवं बाल विकास मंत्रालय (भारत सरकार)',
    category_hi: 'मातृत्व एवं शिशु स्वास्थ्य',
    benefits_hi: 'पहले बच्चे पर ₹5,000 तथा दूसरी बालिका के जन्म पर ₹6,000 की सीधी नकद डीबीटी सहायता।',
    description_hi: 'गर्भवती एवं धात्री माताओं को पोषण सुधार और मजदूरी की क्षतिपूर्ति हेतु आर्थिक सहायता।'
  },

  // 25. Pradhan Mantri Ujjwala Yojana
  'pradhan-mantri-ujjwala-yojana': {
    name_hi: 'प्रधानमंत्री उज्ज्वला योजना 2.0 (PMUY)',
    ministry_hi: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय (भारत सरकार)',
    category_hi: 'स्वच्छ ईंधन व घरेलू सुरक्षा',
    benefits_hi: 'निःशुल्क एलपीजी गैस कनेक्शन, पहला सिलेंडर व चूल्हा मुफ्त, साथ ही प्रति सिलेंडर ₹300 सब्सिडी।',
    description_hi: 'निर्धन ग्रामीण महिलाओं को धुएं से मुक्ति और स्वच्छ रसोई ईंधन प्रदान करने की योजना।'
  },

  // 26. Stand-Up India Scheme for Women Entrepreneurs
  'stand-up-india-scheme-for-women-entrepreneurs': {
    name_hi: 'स्टैंड-अप इंडिया महिला उद्यमी योजना',
    ministry_hi: 'वित्त मंत्रालय (भारत सरकार)',
    category_hi: 'व्यवसाय व उद्यम ऋण',
    benefits_hi: 'ग्रीनफील्ड नया उद्योग लगाने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
    description_hi: 'महिला उद्यमियों को विनिर्माण, सेवा या व्यापारिक उद्यम स्थापित करने हेतु बड़ा ऋण सहयोग।'
  },

  // 27. Sukanya Samriddhi Yojana
  'sukanya-samriddhi-yojana': {
    name_hi: 'सुकन्या समृद्धि योजना (SSY)',
    ministry_hi: 'वित्त मंत्रालय (भारत सरकार)',
    category_hi: 'बालिका बचत व निवेश',
    benefits_hi: '8.2% की उच्चतम सरकारी ब्याज दर, पूर्ण आयकर छूट (80C), 21 वर्ष में परिपक्वता।',
    description_hi: '10 वर्ष से कम आयु की बालिकाओं के सुरक्षित भविष्य, उच्च शिक्षा व विवाह हेतु बचत खाता।'
  },

  // 28. Support to Training and Employment Programme for Women
  'support-to-training-and-employment-programme-for-women': {
    name_hi: 'महिलाओं हेतु प्रशिक्षण एवं रोजगार सहायता कार्यक्रम (STEP)',
    ministry_hi: 'महिला एवं बाल विकास मंत्रालय (भारत सरकार)',
    category_hi: 'कौशल विकास व रोजगार',
    benefits_hi: 'सिलाई, कृषि, हथकरघा, आईटी व हैंडीक्राफ्ट में मुफ्त कौशल प्रशिक्षण और रोजगार संबल।',
    description_hi: 'असंगठित क्षेत्र की महिलाओं को हुनरमंद बनाकर स्वरोजगार या नौकरी से जोड़ने की योजना।'
  },

  // 29. Working Women Hostel Scheme
  'working-women-hostel-scheme': {
    name_hi: 'कामकाजी महिला छात्रावास योजना (सखी निवास)',
    ministry_hi: 'महिला एवं बाल विकास मंत्रालय (भारत सरकार)',
    category_hi: 'सुरक्षित आवास व सहायता',
    benefits_hi: 'शहरों में कामकाजी महिलाओं के लिए सुरक्षित, सुसज्जित रियायती आवास एवं बाल देखभाल (डे-केयर)।',
    description_hi: 'घर से दूर शहरों में काम करने वाली महिलाओं व छात्राओं को सुरक्षित व सस्ता हॉस्टल।'
  },

  // 30. YSR Cheyutha Scheme
  'ysr-cheyutha-scheme': {
    name_hi: 'वाईएसआर चेयूथा योजना (आंध्र प्रदेश)',
    ministry_hi: 'आंध्र प्रदेश सरकार (समाज कल्याण विभाग)',
    category_hi: 'सामाजिक कल्याण व आजीविका',
    benefits_hi: '45-60 वर्ष की महिलाओं को 4 वर्षों में कुल ₹75,000 (₹18,750 प्रति वर्ष) की आजीविका सहायता।',
    description_hi: 'पिछड़े व वंचित वर्ग की महिलाओं को पशुपालन, दुकान व आजीविका साधन स्थापित करने हेतु मदद।'
  }
};

/**
 * Common legacy alias mappings for scheme IDs.
 */
export const SCHEME_ALIAS_MAP: Record<string, string> = {
  'pmmvy-central': 'pradhan-mantri-matru-vandana-yojana',
  'ssy-central': 'sukanya-samriddhi-yojana',
  'step-central': 'support-to-training-and-employment-programme-for-women',
  'standup-india-women': 'stand-up-india-scheme-for-women-entrepreneurs',
  'ignwps-pension': 'indira-gandhi-national-widow-pension-scheme',
  'hf-scheme-001': 'post-graduate-indira-gandhi-scholarship-for-single-girl-child',
  'hf-scheme-002': 'mahila-samman-savings-certificate',
  'hf-scheme-003': 'working-women-hostel-scheme',
};

/**
 * Resolves a scheme ID to its translation entry.
 */
export const getSchemeTranslation = (schemeId?: string): SchemeTranslation | undefined => {
  if (!schemeId) return undefined;
  const targetId = schemeId.trim().toLowerCase();
  const canonicalId = SCHEME_ALIAS_MAP[targetId] || targetId;
  return SCHEME_TRANSLATIONS[canonicalId] || SCHEME_TRANSLATIONS[targetId];
};

export interface LocalizableScheme {
  scheme_id?: string;
  id?: string;
  name?: string;
  name_hi?: string;
  ministry?: string;
  ministry_hi?: string;
  department?: string;
  category?: string;
  category_hi?: string;
  benefits?: string;
  benefits_hi?: string;
  description?: string;
  description_hi?: string;
  application_process?: string;
  application_process_hi?: string;
  documents_required?: string;
  documents_required_hi?: string;
  eligibility_text?: string;
  eligibility_text_hi?: string;
  [key: string]: any;
}

export type LocalizableField = 
  | 'name' 
  | 'ministry' 
  | 'category' 
  | 'benefits' 
  | 'description'
  | 'application_process'
  | 'documents_required'
  | 'eligibility_text';

/**
 * Returns localized string for a scheme attribute based on current language.
 * Priority:
 *   1. Direct localized field on scheme object (e.g. scheme.name_hi, scheme.application_process_hi)
 *   2. Curated translation in SCHEME_TRANSLATIONS registry
 *   3. Fallback to English attribute
 */
export const getLocalizedSchemeField = (
  scheme?: LocalizableScheme | null,
  field: LocalizableField = 'name',
  language: 'en' | 'hi' = 'en'
): string => {
  if (!scheme) return '';

  const fallback = String(scheme[field] || '');
  if (language !== 'hi') {
    return fallback;
  }

  const hiFieldKey = `${field}_hi` as keyof LocalizableScheme;
  const directHiVal = scheme[hiFieldKey];
  if (directHiVal && String(directHiVal).trim().length > 0) {
    return String(directHiVal).trim();
  }

  const sid = scheme.scheme_id || scheme.id;
  const translation = getSchemeTranslation(sid);
  if (!translation) {
    return fallback;
  }

  switch (field) {
    case 'name':
      return translation.name_hi || fallback;
    case 'ministry':
      return translation.ministry_hi || fallback;
    case 'category':
      return translation.category_hi || fallback;
    case 'benefits':
      return translation.benefits_hi || fallback;
    case 'description':
      return translation.description_hi || translation.benefits_hi || fallback;
    case 'application_process':
      return translation.application_process_hi || fallback;
    case 'documents_required':
      return translation.documents_required_hi || fallback;
    case 'eligibility_text':
      return translation.eligibility_text_hi || fallback;
    default:
      return fallback;
  }
};
