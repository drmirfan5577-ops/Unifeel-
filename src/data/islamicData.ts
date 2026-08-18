export const hadithOfDay = {
  arabic: "الدِّينُ النَّصِيحَةُ",
  translation: '"Religion is sincere advice." — Sahih Muslim',
  narrator: "Abu Ruqayyah Tamim ibn Aus ad-Dari (RA)",
};

export const quranSurahs = [
  { id: 1, name: "Al-Fatiha", arabic: "الفاتحة", verses: 7, meaning: "The Opening" },
  { id: 2, name: "Al-Baqarah", arabic: "البقرة", verses: 286, meaning: "The Cow" },
  { id: 3, name: "Al-Imran", arabic: "آل عمران", verses: 200, meaning: "The Family of Imran" },
  { id: 36, name: "Ya-Sin", arabic: "يس", verses: 83, meaning: "Ya Sin" },
  { id: 55, name: "Ar-Rahman", arabic: "الرحمن", verses: 78, meaning: "The Most Gracious" },
  { id: 67, name: "Al-Mulk", arabic: "الملك", verses: 30, meaning: "The Kingdom" },
  { id: 112, name: "Al-Ikhlas", arabic: "الإخلاص", verses: 4, meaning: "The Sincerity" },
  { id: 113, name: "Al-Falaq", arabic: "الفلق", verses: 5, meaning: "The Daybreak" },
  { id: 114, name: "An-Nas", arabic: "الناس", verses: 6, meaning: "Mankind" },
];

export const ahadees = [
  {
    id: 1,
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    urdu: "اعمال کا دارومدار نیتوں پر ہے",
    translation: "Actions are judged by intentions.",
    source: "Sahih Bukhari",
    narrator: "Umar ibn al-Khattab (RA)",
  },
  {
    id: 2,
    arabic: "الدِّينُ النَّصِيحَةُ",
    urdu: "دین خیرخواہی کا نام ہے",
    translation: "Religion is sincere advice.",
    source: "Sahih Muslim",
    narrator: "Tamim ad-Dari (RA)",
  },
  {
    id: 3,
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    urdu: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے",
    translation: "The best of you is the one who learns the Quran and teaches it.",
    source: "Sahih Bukhari",
    narrator: "Uthman ibn Affan (RA)",
  },
  {
    id: 4,
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    urdu: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے مسلمان محفوظ رہیں",
    translation: "A Muslim is one from whose tongue and hand other Muslims are safe.",
    source: "Sahih Bukhari",
    narrator: "Abdullah ibn Amr (RA)",
  },
];

export const morningAzkaar = [
  {
    id: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
    urdu: "ہم نے صبح کی اور اللہ کی بادشاہت میں صبح کی",
    translation: "We have entered the morning and at this very time all sovereignty belongs to Allah.",
    count: 1,
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا",
    urdu: "اے اللہ! تیری توفیق سے ہم نے صبح کی",
    translation: "O Allah, by Your leave we have entered the morning.",
    count: 1,
  },
  {
    id: 3,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    urdu: "اللہ پاک ہے اور اس کی تعریف ہے",
    translation: "Glory be to Allah and praise be to Him.",
    count: 100,
  },
  {
    id: 4,
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    urdu: "میں اللہ کے کامل کلمات کے ذریعے اس کی مخلوق کے شر سے پناہ مانگتا ہوں",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    count: 3,
  },
];

export const eveningAzkaar = [
  {
    id: 1,
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    urdu: "ہم نے شام کی اور اللہ کی بادشاہت میں شام کی",
    translation: "We have entered the evening and at this very time all sovereignty belongs to Allah.",
    count: 1,
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ",
    urdu: "اے اللہ! میں نے شام کی اور تجھے گواہ بناتا ہوں",
    translation: "O Allah, I have entered the evening calling You to witness.",
    count: 4,
  },
  {
    id: 3,
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ",
    urdu: "اللہ کے نام سے جس کے نام کے ساتھ کوئی چیز نقصان نہیں دیتی",
    translation: "In the name of Allah, with whose name nothing in earth or heaven can cause harm.",
    count: 3,
  },
];

export const islamicHubCategories = [
  {
    id: "quran",
    title: "The Holy Quran",
    subtitle: "Read & Listen with translations",
    arabic: "بِسمِ اللَّهِ الرَّحمَنِ الرَّحِيمِ",
    icon: "📖",
    color: "#00897B",
    bgColor: "#E0F2F1",
  },
  {
    id: "ahadees",
    title: "Ahadees",
    subtitle: "Prophetic traditions",
    arabic: "عَن أَبِي هُرَيرَةَ رَضِيَ اللَّهُ عَنهُ",
    icon: "📚",
    color: "#1565C0",
    bgColor: "#E3F2FD",
  },
  {
    id: "morning",
    title: "Morning Azkaar",
    subtitle: "Start your day with Allah",
    arabic: "أَصبَحنَا وَأَصبَحَ المُلكُ لِلَّهِ",
    icon: "🌅",
    color: "#E65100",
    bgColor: "#FFF3E0",
  },
  {
    id: "evening",
    title: "Evening Azkaar",
    subtitle: "Evening supplications from Sunnah",
    arabic: "أَمسَينَا وَأَمسَى المُلكُ لِلَّهِ",
    icon: "🌙",
    color: "#4527A0",
    bgColor: "#EDE7F6",
  },
  {
    id: "protection",
    title: "Protection from Dajjal",
    subtitle: "Essential protections from Fitna",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ",
    icon: "🛡️",
    color: "#B71C1C",
    bgColor: "#FFEBEE",
  },
  {
    id: "dua",
    title: "Daily Du'as",
    subtitle: "Supplications for every occasion",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنيَا حَسَنَةً",
    icon: "🤲",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
  },
];
