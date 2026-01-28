export const supportedLanguages = [
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Bengali', label: 'বাংলা (Bengali)' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
];

export type SupportedLanguage = (typeof supportedLanguages)[number]['value'];
