import React, { useState } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Play, Pause, Search, Bookmark, Volume2, VolumeX } from "lucide-react";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { ahadees, morningAzkaar, eveningAzkaar } from "@/data/islamicData";

type IHubSection = "main" | "quran" | "ahadees" | "morning" | "evening" | "dajjal" | "duas" | "calendar";

const IHubPage: React.FC = () => {
  const [section, setSection] = useState<IHubSection>("main");
  const [lang, setLang] = useState<"ar" | "ur" | "en">("ar");

  if (section === "quran") return <QuranReader onBack={() => setSection("main")} lang={lang} setLang={setLang} />;
  if (section === "ahadees") return <AhadeesSection onBack={() => setSection("main")} />;
  if (section === "morning") return <AzkaarSection onBack={() => setSection("main")} type="morning" />;
  if (section === "evening") return <AzkaarSection onBack={() => setSection("main")} type="evening" />;
  if (section === "duas") return <DuasSection onBack={() => setSection("main")} />;
  if (section === "dajjal") return <DajjalSection onBack={() => setSection("main")} />;
  if (section === "calendar") return <CalendarSection onBack={() => setSection("main")} />;

  const menuItems = [
    { key: "quran", emoji: "📖", label: "The Holy Quran", urdu: "قرآن مجید", arabic: "القرآن الكريم", sub: "114 Surahs • Full Arabic + Translation", bg: "#E8F5E9", color: "#2E7D32" },
    { key: "ahadees", emoji: "📚", label: "Ahadees", urdu: "احادیث مبارکہ", arabic: "الأحاديث النبوية", sub: "Prophetic Traditions", bg: "#E3F2FD", color: "#1565C0" },
    { key: "morning", emoji: "🌅", label: "Morning Azkaar", urdu: "صبح کے اذکار", arabic: "أذكار الصباح", sub: "Start your day with Allah", bg: "#FFF8E1", color: "#F9A825" },
    { key: "evening", emoji: "🌙", label: "Evening Azkaar", urdu: "شام کے اذکار", arabic: "أذكار المساء", sub: "Evening supplications", bg: "#F3E5F5", color: "#7B1FA2" },
    { key: "dajjal", emoji: "🛡️", label: "Protection Duas", urdu: "حفاظت کی دعائیں", arabic: "أدعية الحماية", sub: "Shield from Fitna", bg: "#FFEBEE", color: "#C62828" },
    { key: "duas", emoji: "🤲", label: "Daily Duas", urdu: "روزمرہ دعائیں", arabic: "الأدعية اليومية", sub: "Supplications for every occasion", bg: "#E0F7FA", color: "#00838F" },
    { key: "calendar", emoji: "📅", label: "Islamic Calendar", urdu: "اسلامی تقویم", arabic: "التقويم الهجري", sub: "Hijri dates & Islamic events", bg: "#E8EAF6", color: "#3949AB" },
  ];

  const hadithOfDay = ahadees[new Date().getDay() % ahadees.length];

  return (
    <div className="page-content relative" style={{ background: "#f0fdf4" }}>
      <AnimatedBackground overlay="rgba(240,253,244,0.93)" />

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-3 pb-3" style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32,#388E3C)", boxShadow: "0 4px 20px rgba(27,94,32,0.4)" }}>
        <div className="text-center mb-1">
          <p className="text-white text-base font-bold" style={{ fontFamily: "'Amiri',serif", textShadow: "0 1px 6px rgba(0,0,0,0.2)" }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">☪️</span>
          <h1 className="text-xl font-extrabold text-white">Islamic Hub</h1>
        </div>
        <p className="text-center text-green-200 text-xs mb-2">Quran • Hadith • Azkaar • Calendar</p>
        <div className="flex justify-center gap-2">
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
            <span className="text-[10px]">📅</span>
            <p className="text-white text-[10px] font-medium">{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
            <span className="text-[10px]">☪️</span>
            <p className="text-white text-[10px] font-medium">9 Muharram 1448</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Hadith of Day */}
        <div className="rounded-2xl p-4 mb-4 shadow-lg" style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32,#388E3C)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💎</span>
            <p className="text-green-200 text-xs font-bold uppercase tracking-wider">Hadith of the Day</p>
          </div>
          <p className="text-white text-right text-lg mb-2 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>
            {hadithOfDay.arabic}
          </p>
          <p className="text-green-200 text-xs text-right mb-1" style={{ fontFamily: "'Amiri',serif" }}>{hadithOfDay.urdu}</p>
          <p className="text-green-100 text-xs italic text-center">"{hadithOfDay.translation}" — {hadithOfDay.source}</p>
          <p className="text-green-300 text-[10px] text-center mt-1">Narrator: {hadithOfDay.narrator}</p>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button key={item.key} onClick={() => setSection(item.key as IHubSection)}
              className="w-full bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3 text-left hover:shadow-md transition-all active:scale-[0.99]"
              style={{ border: `1px solid ${item.color}20` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: item.bg }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: item.color, fontFamily: "'Amiri',serif" }}>
                  {item.urdu} • {item.arabic}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: item.color }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== QURAN READER =====================
const allSurahs = [
  { num: 1, name: "Al-Fatiha", arabic: "الفاتحة", meaning: "The Opening", verses: 7, type: "Meccan", juz: 1 },
  { num: 2, name: "Al-Baqarah", arabic: "البقرة", meaning: "The Cow", verses: 286, type: "Medinan", juz: 1 },
  { num: 3, name: "Al-Imran", arabic: "آل عمران", meaning: "Family of Imran", verses: 200, type: "Medinan", juz: 3 },
  { num: 4, name: "An-Nisa", arabic: "النساء", meaning: "The Women", verses: 176, type: "Medinan", juz: 4 },
  { num: 5, name: "Al-Maidah", arabic: "المائدة", meaning: "The Table", verses: 120, type: "Medinan", juz: 6 },
  { num: 6, name: "Al-Anam", arabic: "الأنعام", meaning: "The Cattle", verses: 165, type: "Meccan", juz: 7 },
  { num: 7, name: "Al-Araf", arabic: "الأعراف", meaning: "The Heights", verses: 206, type: "Meccan", juz: 8 },
  { num: 8, name: "Al-Anfal", arabic: "الأنفال", meaning: "The Spoils", verses: 75, type: "Medinan", juz: 9 },
  { num: 9, name: "At-Tawbah", arabic: "التوبة", meaning: "The Repentance", verses: 129, type: "Medinan", juz: 10 },
  { num: 10, name: "Yunus", arabic: "يونس", meaning: "Jonah", verses: 109, type: "Meccan", juz: 11 },
  { num: 11, name: "Hud", arabic: "هود", meaning: "Hud", verses: 123, type: "Meccan", juz: 11 },
  { num: 12, name: "Yusuf", arabic: "يوسف", meaning: "Joseph", verses: 111, type: "Meccan", juz: 12 },
  { num: 13, name: "Ar-Rad", arabic: "الرعد", meaning: "The Thunder", verses: 43, type: "Medinan", juz: 13 },
  { num: 14, name: "Ibrahim", arabic: "إبراهيم", meaning: "Abraham", verses: 52, type: "Meccan", juz: 13 },
  { num: 15, name: "Al-Hijr", arabic: "الحجر", meaning: "The Rock", verses: 99, type: "Meccan", juz: 14 },
  { num: 16, name: "An-Nahl", arabic: "النحل", meaning: "The Bee", verses: 128, type: "Meccan", juz: 14 },
  { num: 17, name: "Al-Isra", arabic: "الإسراء", meaning: "The Night Journey", verses: 111, type: "Meccan", juz: 15 },
  { num: 18, name: "Al-Kahf", arabic: "الكهف", meaning: "The Cave", verses: 110, type: "Meccan", juz: 15 },
  { num: 19, name: "Maryam", arabic: "مريم", meaning: "Mary", verses: 98, type: "Meccan", juz: 16 },
  { num: 20, name: "Ta-Ha", arabic: "طه", meaning: "Ta-Ha", verses: 135, type: "Meccan", juz: 16 },
  { num: 21, name: "Al-Anbiya", arabic: "الأنبياء", meaning: "The Prophets", verses: 112, type: "Meccan", juz: 17 },
  { num: 22, name: "Al-Hajj", arabic: "الحج", meaning: "The Pilgrimage", verses: 78, type: "Medinan", juz: 17 },
  { num: 23, name: "Al-Muminun", arabic: "المؤمنون", meaning: "The Believers", verses: 118, type: "Meccan", juz: 18 },
  { num: 24, name: "An-Nur", arabic: "النور", meaning: "The Light", verses: 64, type: "Medinan", juz: 18 },
  { num: 25, name: "Al-Furqan", arabic: "الفرقان", meaning: "The Criterion", verses: 77, type: "Meccan", juz: 18 },
  { num: 26, name: "Ash-Shuara", arabic: "الشعراء", meaning: "The Poets", verses: 227, type: "Meccan", juz: 19 },
  { num: 27, name: "An-Naml", arabic: "النمل", meaning: "The Ant", verses: 93, type: "Meccan", juz: 19 },
  { num: 28, name: "Al-Qasas", arabic: "القصص", meaning: "The Stories", verses: 88, type: "Meccan", juz: 20 },
  { num: 29, name: "Al-Ankabut", arabic: "العنكبوت", meaning: "The Spider", verses: 69, type: "Meccan", juz: 20 },
  { num: 30, name: "Ar-Rum", arabic: "الروم", meaning: "The Romans", verses: 60, type: "Meccan", juz: 21 },
  { num: 31, name: "Luqman", arabic: "لقمان", meaning: "Luqman", verses: 34, type: "Meccan", juz: 21 },
  { num: 32, name: "As-Sajdah", arabic: "السجدة", meaning: "The Prostration", verses: 30, type: "Meccan", juz: 21 },
  { num: 33, name: "Al-Ahzab", arabic: "الأحزاب", meaning: "The Clans", verses: 73, type: "Medinan", juz: 21 },
  { num: 34, name: "Saba", arabic: "سبأ", meaning: "Sheba", verses: 54, type: "Meccan", juz: 22 },
  { num: 35, name: "Fatir", arabic: "فاطر", meaning: "Originator", verses: 45, type: "Meccan", juz: 22 },
  { num: 36, name: "Ya-Sin", arabic: "يس", meaning: "Ya Sin", verses: 83, type: "Meccan", juz: 22 },
  { num: 37, name: "As-Saffat", arabic: "الصافات", meaning: "Those Lined Up", verses: 182, type: "Meccan", juz: 23 },
  { num: 38, name: "Sad", arabic: "ص", meaning: "Sad", verses: 88, type: "Meccan", juz: 23 },
  { num: 39, name: "Az-Zumar", arabic: "الزمر", meaning: "The Groups", verses: 75, type: "Meccan", juz: 23 },
  { num: 40, name: "Ghafir", arabic: "غافر", meaning: "The Forgiver", verses: 85, type: "Meccan", juz: 24 },
  { num: 41, name: "Fussilat", arabic: "فصلت", meaning: "Explained in Detail", verses: 54, type: "Meccan", juz: 24 },
  { num: 42, name: "Ash-Shura", arabic: "الشورى", meaning: "The Consultation", verses: 53, type: "Meccan", juz: 25 },
  { num: 43, name: "Az-Zukhruf", arabic: "الزخرف", meaning: "The Ornaments", verses: 89, type: "Meccan", juz: 25 },
  { num: 44, name: "Ad-Dukhan", arabic: "الدخان", meaning: "The Smoke", verses: 59, type: "Meccan", juz: 25 },
  { num: 45, name: "Al-Jathiyah", arabic: "الجاثية", meaning: "Crouching", verses: 37, type: "Meccan", juz: 25 },
  { num: 46, name: "Al-Ahqaf", arabic: "الأحقاف", meaning: "The Sand Dunes", verses: 35, type: "Meccan", juz: 26 },
  { num: 47, name: "Muhammad", arabic: "محمد", meaning: "Muhammad", verses: 38, type: "Medinan", juz: 26 },
  { num: 48, name: "Al-Fath", arabic: "الفتح", meaning: "The Victory", verses: 29, type: "Medinan", juz: 26 },
  { num: 49, name: "Al-Hujurat", arabic: "الحجرات", meaning: "The Chambers", verses: 18, type: "Medinan", juz: 26 },
  { num: 50, name: "Qaf", arabic: "ق", meaning: "Qaf", verses: 45, type: "Meccan", juz: 26 },
  { num: 51, name: "Adh-Dhariyat", arabic: "الذاريات", meaning: "The Winds", verses: 60, type: "Meccan", juz: 26 },
  { num: 52, name: "At-Tur", arabic: "الطور", meaning: "The Mount", verses: 49, type: "Meccan", juz: 27 },
  { num: 53, name: "An-Najm", arabic: "النجم", meaning: "The Star", verses: 62, type: "Meccan", juz: 27 },
  { num: 54, name: "Al-Qamar", arabic: "القمر", meaning: "The Moon", verses: 55, type: "Meccan", juz: 27 },
  { num: 55, name: "Ar-Rahman", arabic: "الرحمن", meaning: "The Merciful", verses: 78, type: "Medinan", juz: 27 },
  { num: 56, name: "Al-Waqiah", arabic: "الواقعة", meaning: "The Inevitable", verses: 96, type: "Meccan", juz: 27 },
  { num: 57, name: "Al-Hadid", arabic: "الحديد", meaning: "The Iron", verses: 29, type: "Medinan", juz: 27 },
  { num: 58, name: "Al-Mujadila", arabic: "المجادلة", meaning: "The Dispute", verses: 22, type: "Medinan", juz: 28 },
  { num: 59, name: "Al-Hashr", arabic: "الحشر", meaning: "The Gathering", verses: 24, type: "Medinan", juz: 28 },
  { num: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", meaning: "The Tested", verses: 13, type: "Medinan", juz: 28 },
  { num: 61, name: "As-Saf", arabic: "الصف", meaning: "The Row", verses: 14, type: "Medinan", juz: 28 },
  { num: 62, name: "Al-Jumuah", arabic: "الجمعة", meaning: "Friday", verses: 11, type: "Medinan", juz: 28 },
  { num: 63, name: "Al-Munafiqun", arabic: "المنافقون", meaning: "The Hypocrites", verses: 11, type: "Medinan", juz: 28 },
  { num: 64, name: "At-Taghabun", arabic: "التغابن", meaning: "Mutual Disillusion", verses: 18, type: "Medinan", juz: 28 },
  { num: 65, name: "At-Talaq", arabic: "الطلاق", meaning: "Divorce", verses: 12, type: "Medinan", juz: 28 },
  { num: 66, name: "At-Tahrim", arabic: "التحريم", meaning: "The Prohibition", verses: 12, type: "Medinan", juz: 28 },
  { num: 67, name: "Al-Mulk", arabic: "الملك", meaning: "The Kingdom", verses: 30, type: "Meccan", juz: 29 },
  { num: 68, name: "Al-Qalam", arabic: "القلم", meaning: "The Pen", verses: 52, type: "Meccan", juz: 29 },
  { num: 69, name: "Al-Haqqah", arabic: "الحاقة", meaning: "The Inevitable", verses: 52, type: "Meccan", juz: 29 },
  { num: 70, name: "Al-Maarij", arabic: "المعارج", meaning: "The Ascent", verses: 44, type: "Meccan", juz: 29 },
  { num: 71, name: "Nuh", arabic: "نوح", meaning: "Noah", verses: 28, type: "Meccan", juz: 29 },
  { num: 72, name: "Al-Jinn", arabic: "الجن", meaning: "The Jinn", verses: 28, type: "Meccan", juz: 29 },
  { num: 73, name: "Al-Muzzammil", arabic: "المزمل", meaning: "The Enshrouded", verses: 20, type: "Meccan", juz: 29 },
  { num: 74, name: "Al-Muddaththir", arabic: "المدثر", meaning: "The Cloaked", verses: 56, type: "Meccan", juz: 29 },
  { num: 75, name: "Al-Qiyamah", arabic: "القيامة", meaning: "The Resurrection", verses: 40, type: "Meccan", juz: 29 },
  { num: 76, name: "Al-Insan", arabic: "الإنسان", meaning: "The Human", verses: 31, type: "Medinan", juz: 29 },
  { num: 77, name: "Al-Mursalat", arabic: "المرسلات", meaning: "The Emissaries", verses: 50, type: "Meccan", juz: 29 },
  { num: 78, name: "An-Naba", arabic: "النبأ", meaning: "The Tidings", verses: 40, type: "Meccan", juz: 30 },
  { num: 79, name: "An-Naziat", arabic: "النازعات", meaning: "Those Who Drag", verses: 46, type: "Meccan", juz: 30 },
  { num: 80, name: "Abasa", arabic: "عبس", meaning: "He Frowned", verses: 42, type: "Meccan", juz: 30 },
  { num: 81, name: "At-Takwir", arabic: "التكوير", meaning: "The Folding", verses: 29, type: "Meccan", juz: 30 },
  { num: 82, name: "Al-Infitar", arabic: "الانفطار", meaning: "The Cleaving", verses: 19, type: "Meccan", juz: 30 },
  { num: 83, name: "Al-Mutaffifin", arabic: "المطففين", meaning: "Defrauding", verses: 36, type: "Meccan", juz: 30 },
  { num: 84, name: "Al-Inshiqaq", arabic: "الانشقاق", meaning: "The Splitting", verses: 25, type: "Meccan", juz: 30 },
  { num: 85, name: "Al-Buruj", arabic: "البروج", meaning: "The Constellations", verses: 22, type: "Meccan", juz: 30 },
  { num: 86, name: "At-Tariq", arabic: "الطارق", meaning: "The Night Star", verses: 17, type: "Meccan", juz: 30 },
  { num: 87, name: "Al-Ala", arabic: "الأعلى", meaning: "The Most High", verses: 19, type: "Meccan", juz: 30 },
  { num: 88, name: "Al-Ghashiyah", arabic: "الغاشية", meaning: "The Overwhelming", verses: 26, type: "Meccan", juz: 30 },
  { num: 89, name: "Al-Fajr", arabic: "الفجر", meaning: "The Dawn", verses: 30, type: "Meccan", juz: 30 },
  { num: 90, name: "Al-Balad", arabic: "البلد", meaning: "The City", verses: 20, type: "Meccan", juz: 30 },
  { num: 91, name: "Ash-Shams", arabic: "الشمس", meaning: "The Sun", verses: 15, type: "Meccan", juz: 30 },
  { num: 92, name: "Al-Layl", arabic: "الليل", meaning: "The Night", verses: 21, type: "Meccan", juz: 30 },
  { num: 93, name: "Ad-Duha", arabic: "الضحى", meaning: "The Morning", verses: 11, type: "Meccan", juz: 30 },
  { num: 94, name: "Ash-Sharh", arabic: "الشرح", meaning: "The Relief", verses: 8, type: "Meccan", juz: 30 },
  { num: 95, name: "At-Tin", arabic: "التين", meaning: "The Fig", verses: 8, type: "Meccan", juz: 30 },
  { num: 96, name: "Al-Alaq", arabic: "العلق", meaning: "The Clot", verses: 19, type: "Meccan", juz: 30 },
  { num: 97, name: "Al-Qadr", arabic: "القدر", meaning: "The Power", verses: 5, type: "Meccan", juz: 30 },
  { num: 98, name: "Al-Bayyinah", arabic: "البينة", meaning: "The Evidence", verses: 8, type: "Medinan", juz: 30 },
  { num: 99, name: "Az-Zalzalah", arabic: "الزلزلة", meaning: "The Earthquake", verses: 8, type: "Medinan", juz: 30 },
  { num: 100, name: "Al-Adiyat", arabic: "العاديات", meaning: "The Chargers", verses: 11, type: "Meccan", juz: 30 },
  { num: 101, name: "Al-Qariah", arabic: "القارعة", meaning: "The Calamity", verses: 11, type: "Meccan", juz: 30 },
  { num: 102, name: "At-Takathur", arabic: "التكاثر", meaning: "The Rivalry", verses: 8, type: "Meccan", juz: 30 },
  { num: 103, name: "Al-Asr", arabic: "العصر", meaning: "The Time", verses: 3, type: "Meccan", juz: 30 },
  { num: 104, name: "Al-Humazah", arabic: "الهمزة", meaning: "The Slanderer", verses: 9, type: "Meccan", juz: 30 },
  { num: 105, name: "Al-Fil", arabic: "الفيل", meaning: "The Elephant", verses: 5, type: "Meccan", juz: 30 },
  { num: 106, name: "Quraysh", arabic: "قريش", meaning: "Quraysh", verses: 4, type: "Meccan", juz: 30 },
  { num: 107, name: "Al-Maun", arabic: "الماعون", meaning: "Small Kindnesses", verses: 7, type: "Meccan", juz: 30 },
  { num: 108, name: "Al-Kawthar", arabic: "الكوثر", meaning: "Abundance", verses: 3, type: "Meccan", juz: 30 },
  { num: 109, name: "Al-Kafirun", arabic: "الكافرون", meaning: "The Disbelievers", verses: 6, type: "Meccan", juz: 30 },
  { num: 110, name: "An-Nasr", arabic: "النصر", meaning: "The Help", verses: 3, type: "Medinan", juz: 30 },
  { num: 111, name: "Al-Masad", arabic: "المسد", meaning: "The Palm Fiber", verses: 5, type: "Meccan", juz: 30 },
  { num: 112, name: "Al-Ikhlas", arabic: "الإخلاص", meaning: "The Sincerity", verses: 4, type: "Meccan", juz: 30 },
  { num: 113, name: "Al-Falaq", arabic: "الفلق", meaning: "The Dawn", verses: 5, type: "Meccan", juz: 30 },
  { num: 114, name: "An-Nas", arabic: "الناس", meaning: "Mankind", verses: 6, type: "Meccan", juz: 30 },
];

const surahVerses: Record<number, { num: number; arabic: string; urdu: string; english: string }[]> = {
  1: [
    { num: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", english: "In the name of Allah, the Entirely Merciful, the Especially Merciful" },
    { num: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", urdu: "سب تعریف اللہ کے لیے ہے جو سارے جہانوں کا پالنے والا ہے", english: "All praise is due to Allah, Lord of the worlds" },
    { num: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", urdu: "جو بڑا مہربان نہایت رحم والا ہے", english: "The Entirely Merciful, the Especially Merciful" },
    { num: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", urdu: "روز جزا کا مالک ہے", english: "Master of the Day of Recompense" },
    { num: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", urdu: "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں", english: "It is You we worship and You we ask for help" },
    { num: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", urdu: "ہمیں سیدھی راہ پر چلا", english: "Guide us to the straight path" },
    { num: 7, arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", urdu: "ان لوگوں کی راہ جن پر تو نے انعام کیا، نہ ان کی جن پر غضب ہوا اور نہ گمراہوں کی", english: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or those who are astray" },
  ],
  112: [
    { num: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", urdu: "کہہ دو کہ اللہ ایک ہے", english: "Say: He is Allah, [who is] One" },
    { num: 2, arabic: "اللَّهُ الصَّمَدُ", urdu: "اللہ بے نیاز ہے", english: "Allah, the Eternal Refuge" },
    { num: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", urdu: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے", english: "He neither begets nor is born" },
    { num: 4, arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", urdu: "اور نہ کوئی اس کا ہم سر ہے", english: "Nor is there to Him any equivalent" },
  ],
  113: [
    { num: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", urdu: "کہہ دو کہ میں صبح کے رب کی پناہ مانگتا ہوں", english: "Say: I seek refuge in the Lord of daybreak" },
    { num: 2, arabic: "مِن شَرِّ مَا خَلَقَ", urdu: "اس کی تمام مخلوق کے شر سے", english: "From the evil of that which He created" },
    { num: 3, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", urdu: "اور رات کے اندھیرے کے شر سے جب وہ چھا جائے", english: "And from the evil of darkness when it settles" },
    { num: 4, arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", urdu: "اور گانٹھوں پر پھونکنے والیوں کے شر سے", english: "And from the evil of the blowers in knots" },
    { num: 5, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", urdu: "اور حاسد کے شر سے جب وہ حسد کرے", english: "And from the evil of an envier when he envies" },
  ],
  114: [
    { num: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", urdu: "کہہ دو میں انسانوں کے رب کی پناہ مانگتا ہوں", english: "Say: I seek refuge in the Lord of mankind" },
    { num: 2, arabic: "مَلِكِ النَّاسِ", urdu: "انسانوں کے بادشاہ کی", english: "The Sovereign of mankind" },
    { num: 3, arabic: "إِلَٰهِ النَّاسِ", urdu: "انسانوں کے معبود کی", english: "The God of mankind" },
    { num: 4, arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", urdu: "وسوسہ ڈالنے والے کے شر سے", english: "From the evil of the retreating whisperer" },
    { num: 5, arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", urdu: "جو لوگوں کے دلوں میں وسوسے ڈالتا ہے", english: "Who whispers in the breasts of mankind" },
    { num: 6, arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", urdu: "جنوں میں سے اور انسانوں میں سے", english: "From among the jinn and mankind" },
  ],
  103: [
    { num: 1, arabic: "وَالْعَصْرِ", urdu: "زمانے کی قسم", english: "By time" },
    { num: 2, arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", urdu: "بے شک انسان گھاٹے میں ہے", english: "Indeed, mankind is in loss" },
    { num: 3, arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", urdu: "سوائے ان لوگوں کے جو ایمان لائے اور نیک اعمال کیے اور ایک دوسرے کو حق کی تلقین کی اور ایک دوسرے کو صبر کی نصیحت کی", english: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience" },
  ],
  108: [
    { num: 1, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", urdu: "بے شک ہم نے تمہیں کوثر عطا کی", english: "Indeed, We have granted you al-Kawthar" },
    { num: 2, arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", urdu: "پس اپنے رب کے لیے نماز پڑھو اور قربانی کرو", english: "So pray to your Lord and sacrifice [to Him alone]" },
    { num: 3, arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", urdu: "بے شک تمہارا دشمن ہی لاوارث ہے", english: "Indeed, your enemy is the one cut off" },
  ],
  110: [
    { num: 1, arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", urdu: "جب اللہ کی مدد اور فتح آ جائے", english: "When the victory of Allah has come and the conquest" },
    { num: 2, arabic: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", urdu: "اور تم دیکھو کہ لوگ فوج در فوج اللہ کے دین میں داخل ہو رہے ہیں", english: "And you see the people entering into the religion of Allah in multitudes" },
    { num: 3, arabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", urdu: "تو اپنے رب کی تعریف کے ساتھ تسبیح کرو اور اس سے مغفرت مانگو، بے شک وہ توبہ قبول کرنے والا ہے", english: "Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance" },
  ],
};

const QuranReader: React.FC<{
  onBack: () => void;
  lang: "ar" | "ur" | "en";
  setLang: (l: "ar" | "ur" | "en") => void;
}> = ({ onBack, lang, setLang }) => {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filtered = allSurahs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.arabic.includes(search) ||
    s.meaning.toLowerCase().includes(search.toLowerCase()) ||
    String(s.num).includes(search)
  );

  const playAudio = (surahNum: number, verseNum?: number) => {
    const surahPad = String(surahNum).padStart(3, "0");
    const versePad = verseNum ? String(verseNum).padStart(3, "0") : "001";
    const url = `https://verses.quran.com/Alafasy/mp3/${surahPad}${versePad}.mp3`;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
    setPlayingVerse(verseNum || 1);
    setIsPlaying(true);
    audioRef.current.onended = () => { setIsPlaying(false); setPlayingVerse(null); };
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setPlayingVerse(null);
  };

  if (selectedSurah !== null) {
    const surah = allSurahs.find(s => s.num === selectedSurah);
    const verses = surahVerses[selectedSurah] || [];

    return (
      <div className="page-content relative" style={{ background: "#f9fffe" }}>
        <div className="sticky top-0 z-20 px-3 py-2.5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32,#388E3C)", boxShadow: "0 3px 16px rgba(27,94,32,0.4)" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => { stopAudio(); setSelectedSurah(null); }}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={18} color="white" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">{surah?.name} — {surah?.arabic}</h1>
              <p className="text-green-200 text-[10px]">{surah?.verses} verses · {surah?.type} · Juz {surah?.juz}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(["ar","ur","en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-2 py-1 rounded-full text-[10px] font-bold"
                style={{ background: lang === l ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)", color: lang === l ? "#1B5E20" : "white" }}>
                {l === "ar" ? "عر" : l === "ur" ? "اردو" : "EN"}
              </button>
            ))}
            <button onClick={() => isPlaying ? stopAudio() : playAudio(selectedSurah)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 ml-1">
              {isPlaying ? <VolumeX size={14} color="white" /> : <Volume2 size={14} color="white" />}
            </button>
          </div>
        </div>

        {surah?.num !== 9 && (
          <div className="text-center py-4 bg-green-50 border-b border-green-100">
            <p className="text-green-800 text-2xl" style={{ fontFamily: "'Amiri',serif", lineHeight: "2" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        <div className="px-3 pt-3 space-y-3">
          {verses.map(v => (
            <div key={v.num} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100" style={{ background: "#f8fdf8" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#2E7D32,#4CAF50)" }}>
                  {v.num}
                </div>
                <button onClick={() => playingVerse === v.num ? stopAudio() : playAudio(selectedSurah, v.num)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: playingVerse === v.num ? "#E8F5E9" : "#f5f5f5" }}>
                  {playingVerse === v.num ? <Pause size={12} className="text-green-600" /> : <Play size={12} className="text-gray-400" />}
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="text-right text-xl leading-loose text-gray-800 mb-2"
                  style={{ fontFamily: "'Amiri',serif", lineHeight: "2.3", color: "#1a1a1a" }}>
                  {v.arabic}
                </p>
                {lang !== "ar" && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed"
                      style={{ textAlign: lang === "ur" ? "right" : "left", direction: lang === "ur" ? "rtl" : "ltr", fontFamily: lang === "ur" ? "'Amiri',serif" : "inherit" }}>
                      {lang === "ur" ? v.urdu : v.english}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {verses.length === 0 && (
            <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-100">
              <div className="text-4xl mb-3">📖</div>
              <p className="font-bold text-green-700 mb-1">{surah?.arabic}</p>
              <p className="text-green-600 text-sm">{surah?.verses} verses available</p>
              <p className="text-green-500 text-xs mt-2">Full Arabic text with Urdu & English translations</p>
              <button onClick={() => playAudio(selectedSurah)}
                className="mt-3 px-5 py-2 rounded-xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg,#2E7D32,#4CAF50)" }}>
                {isPlaying ? "⏸ Pause Audio" : "▶ Play Recitation"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content relative" style={{ background: "#f0fdf4" }}>
      <div className="sticky top-0 z-20 px-3 py-3" style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)", boxShadow: "0 3px 14px rgba(27,94,32,0.4)" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={18} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-white">📖 The Holy Quran</h1>
            <p className="text-green-200 text-[10px]">114 Surahs · Full Arabic + Urdu + English</p>
          </div>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Surah name or number..."
            className="w-full search-input pl-9 pr-4 py-2 text-sm outline-none" />
        </div>
      </div>

      <div className="px-3 pt-3 space-y-1.5">
        {filtered.map(surah => (
          <button key={surah.num} onClick={() => setSelectedSurah(surah.num)}
            className="w-full bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3 text-left hover:shadow-md transition-all active:scale-[0.99]">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 text-xs"
              style={{ background: "linear-gradient(135deg,#2E7D32,#4CAF50)" }}>
              {surah.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 text-sm">{surah.name}</p>
                <p className="text-gray-600 text-base" style={{ fontFamily: "'Amiri',serif" }}>{surah.arabic}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400">{surah.meaning}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[10px] text-gray-400">{surah.verses}v</span>
                <span className="text-gray-200">·</span>
                <span className="text-[10px]" style={{ color: surah.type === "Meccan" ? "#F9A825" : "#4CAF50" }}>{surah.type}</span>
                <span className="text-gray-200">·</span>
                <span className="text-[10px] text-gray-400">Juz {surah.juz}</span>
              </div>
            </div>
            {bookmarked.includes(surah.num) && <Bookmark size={14} style={{ color: "#2E7D32" }} />}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===================== AHADEES =====================
const fullAhadees = [
  { id: 1, arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", urdu: "اعمال کا دارومدار نیتوں پر ہے", english: "Actions are judged by intentions", source: "Sahih Bukhari", narrator: "Umar ibn al-Khattab (RA)" },
  { id: 2, arabic: "الدِّينُ النَّصِيحَةُ", urdu: "دین خیرخواہی کا نام ہے", english: "Religion is sincere advice", source: "Sahih Muslim", narrator: "Tamim ad-Dari (RA)" },
  { id: 3, arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", urdu: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے", english: "The best of you is the one who learns the Quran and teaches it", source: "Sahih Bukhari", narrator: "Uthman ibn Affan (RA)" },
  { id: 4, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", urdu: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے مسلمان محفوظ رہیں", english: "A Muslim is one from whose tongue and hand Muslims are safe", source: "Sahih Bukhari", narrator: "Abdullah ibn Amr (RA)" },
  { id: 5, arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", urdu: "تم میں سے کوئی مومن نہیں جب تک اپنے بھائی کے لیے وہی نہ پسند کرے جو اپنے لیے پسند کرتا ہے", english: "None of you truly believes until he loves for his brother what he loves for himself", source: "Sahih Bukhari", narrator: "Anas ibn Malik (RA)" },
  { id: 6, arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنتَ", urdu: "جہاں بھی ہو اللہ سے ڈرتے رہو", english: "Fear Allah wherever you are", source: "Tirmidhi", narrator: "Abu Dharr (RA)" },
  { id: 7, arabic: "الطَّهُورُ شَطْرُ الْإِيمَانِ", urdu: "پاکیزگی نصف ایمان ہے", english: "Cleanliness is half of faith", source: "Sahih Muslim", narrator: "Abu Malik al-Ashari (RA)" },
  { id: 8, arabic: "خَيْرُ الْأُمُورِ أَوْسَطُهَا", urdu: "بہترین کام وہ ہے جو میانہ روی والا ہو", english: "The best of matters is the middle course", source: "Bayhaqi", narrator: "Narrated widely" },
  { id: 9, arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", urdu: "جو ہمیں دھوکہ دے وہ ہم میں سے نہیں", english: "Whoever deceives us is not from us", source: "Sahih Muslim", narrator: "Abu Hurairah (RA)" },
  { id: 10, arabic: "اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", urdu: "صبر اور نماز کے ذریعے مدد حاصل کرو", english: "Seek help through patience and prayer", source: "Al-Quran 2:153", narrator: "Divine Command" },
];

const AhadeesSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const hadith = selected !== null ? fullAhadees[selected] : null;
  return (
    <div className="page-content" style={{ background: "#f0f8ff" }}>
      <div className="sticky top-0 z-20 px-3 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#0D47A1,#1565C0,#1976D2)", boxShadow: "0 3px 14px rgba(13,71,161,0.4)" }}>
        <button onClick={selected !== null ? () => setSelected(null) : onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={18} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">📚 Ahadees</h1>
          <p className="text-blue-200 text-[10px]">Prophetic Traditions</p>
        </div>
      </div>
      {hadith ? (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">Hadith #{hadith.id}</p>
              <p className="text-2xl text-blue-900 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>{hadith.arabic}</p>
            </div>
            <p className="text-right text-gray-700 text-base mb-3 leading-relaxed" style={{ fontFamily: "'Amiri',serif", direction: "rtl" }}>{hadith.urdu}</p>
            <p className="text-gray-600 text-sm leading-relaxed italic mb-3">"{hadith.english}"</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs font-bold text-blue-600">{hadith.source}</p>
                <p className="text-[10px] text-gray-400">{hadith.narrator}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 pt-3 space-y-2">
          {fullAhadees.map((h, i) => (
            <button key={h.id} onClick={() => setSelected(i)}
              className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-all active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#1565C0,#1976D2)" }}>{h.id}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-right text-gray-800 mb-1 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>{h.arabic}</p>
                  <p className="text-xs text-gray-500 italic truncate">"{h.english}"</p>
                  <p className="text-[10px] text-blue-500 font-medium mt-1">{h.source} · {h.narrator}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== AZKAAR =====================
const AzkaarSection: React.FC<{ onBack: () => void; type: "morning" | "evening" }> = ({ onBack, type }) => {
  const items = type === "morning" ? morningAzkaar : eveningAzkaar;
  const [counts, setCounts] = useState<Record<number, number>>({});
  const color = type === "morning" ? "#F57F17" : "#4527A0";
  const bg = type === "morning" ? "linear-gradient(135deg,#E65100,#F57F17,#FFC107)" : "linear-gradient(135deg,#4A148C,#7B1FA2,#AB47BC)";

  return (
    <div className="page-content" style={{ background: type === "morning" ? "#fffde7" : "#f3e5f5" }}>
      <div className="sticky top-0 z-20 px-3 py-3 flex items-center gap-2" style={{ background: bg, boxShadow: "0 3px 14px rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={18} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">{type === "morning" ? "🌅 Morning Azkaar" : "🌙 Evening Azkaar"}</h1>
          <p className="text-white/70 text-[10px]">{type === "morning" ? "صبح کے اذکار" : "شام کے اذکار"}</p>
        </div>
      </div>
      <div className="px-3 pt-3 space-y-3">
        {items.map(item => {
          const done = (counts[item.id] || 0) >= item.count;
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3">
                <p className="text-right text-xl text-gray-800 mb-2 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>{item.arabic}</p>
                <p className="text-right text-sm text-gray-600 mb-1" style={{ fontFamily: "'Amiri',serif", direction: "rtl" }}>{item.urdu}</p>
                <p className="text-xs text-gray-400 italic">{item.translation}</p>
              </div>
              <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold" style={{ color }}>{counts[item.id] || 0}/{item.count}</div>
                  {done && <span className="text-green-500 text-[10px] font-bold">✅ Complete</span>}
                </div>
                <button onClick={() => setCounts(p => ({ ...p, [item.id]: Math.min((p[item.id] || 0) + 1, item.count) }))}
                  disabled={done}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all active:scale-95"
                  style={{ background: done ? "#E0E0E0" : bg, opacity: done ? 0.6 : 1 }}>
                  Count
                </button>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-b-2xl">
                <div className="h-full rounded-b-2xl transition-all" style={{ width: `${Math.min(((counts[item.id] || 0) / item.count) * 100, 100)}%`, background: bg }} />
              </div>
            </div>
          );
        })}
        <div className="text-center py-4">
          <button onClick={() => setCounts({})} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: bg }}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== DUAS =====================
const DuasSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const duas = [
    { id: 1, title: "Dua before eating", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", urdu: "اللہ کے نام سے اور اللہ کی برکت کے ساتھ", english: "In the name of Allah and with the blessings of Allah" },
    { id: 2, title: "Dua after eating", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", urdu: "تمام تعریف اللہ کے لیے جس نے ہمیں کھلایا اور پلایا", english: "Praise be to Allah who fed us and gave us drink" },
    { id: 3, title: "Dua entering home", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ", urdu: "اے اللہ! میں تجھ سے داخل ہونے کی بھلائی اور نکلنے کی بھلائی مانگتا ہوں", english: "O Allah, I ask You for the best entry and the best exit" },
    { id: 4, title: "Dua leaving home", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ", urdu: "اللہ کے نام سے، اللہ پر توکل کیا", english: "In the name of Allah, I place my trust in Allah" },
    { id: 5, title: "Dua for travel", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", urdu: "پاک ہے وہ ذات جس نے ہمارے لیے اسے مسخر کیا", english: "Glory be to He who has subjected this to us" },
    { id: 6, title: "Dua before sleeping", arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", urdu: "اے اللہ! تیرے نام سے مرتا ہوں اور جیتا ہوں", english: "O Allah, in Your name I die and I live" },
    { id: 7, title: "Dua upon waking up", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا", urdu: "تعریف ہے اللہ کے لیے جس نے مارنے کے بعد ہمیں زندہ کیا", english: "Praise be to Allah who gave us life after causing us to die" },
    { id: 8, title: "Dua for parents", arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", urdu: "اے رب! ان پر رحم فرما جیسا انہوں نے مجھے بچپن میں پالا", english: "My Lord, have mercy upon them as they brought me up when I was small" },
    { id: 9, title: "Dua for forgiveness", arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا", urdu: "اے ہمارے رب! ہمارے گناہوں اور ہماری زیادتیوں کو معاف فرما", english: "Our Lord, forgive us our sins and our excesses in our affairs" },
    { id: 10, title: "Dua for good in both worlds", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", urdu: "اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھی بھلائی دے", english: "Our Lord, give us good in this world and good in the Hereafter" },
  ];
  return (
    <div className="page-content" style={{ background: "#e0f7fa" }}>
      <div className="sticky top-0 z-20 px-3 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#004D40,#00695C,#00838F)", boxShadow: "0 3px 14px rgba(0,77,64,0.4)" }}>
        <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={18} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">🤲 Daily Duas</h1>
          <p className="text-teal-200 text-[10px]">روزمرہ دعائیں · Supplications</p>
        </div>
      </div>
      <div className="px-3 pt-3 space-y-2.5">
        {duas.map(d => (
          <div key={d.id} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-bold text-teal-600 mb-2 uppercase tracking-wider">{d.title}</p>
            <p className="text-right text-xl text-gray-800 mb-2 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>{d.arabic}</p>
            <p className="text-right text-sm text-gray-600 mb-1" style={{ fontFamily: "'Amiri',serif", direction: "rtl" }}>{d.urdu}</p>
            <p className="text-xs text-gray-400 italic">{d.english}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================== DAJJAL PROTECTION =====================
const DajjalSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const items = [
    { title: "Surah Al-Kahf (First 10 verses)", arabic: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا", urdu: "جو لوگ کھڑے بیٹھے اللہ کو یاد کرتے رہتے ہیں", english: "Recite first 10 verses of Surah Kahf every Friday", source: "Sahih Muslim" },
    { title: "Refuge from 4 Trials", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ", urdu: "اے اللہ! میں جہنم کے عذاب سے تیری پناہ مانگتا ہوں", english: "O Allah, I seek refuge from punishment of Hell, grave, trials of life and death, and trial of Dajjal", source: "Sahih Muslim" },
    { title: "Ayat al-Kursi", arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", urdu: "اللہ — اس کے سوا کوئی معبود نہیں، وہ زندہ جاوید ہے", english: "Recite Ayat al-Kursi after every prayer and before sleeping", source: "Sahih Bukhari" },
    { title: "Last verses of Al-Baqarah", arabic: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ", urdu: "رسول اس چیز پر ایمان لائے جو ان پر نازل کی گئی", english: "Recite last two verses of Surah Al-Baqarah every night", source: "Sahih Bukhari" },
  ];
  return (
    <div className="page-content" style={{ background: "#ffebee" }}>
      <div className="sticky top-0 z-20 px-3 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#B71C1C,#C62828,#D32F2F)", boxShadow: "0 3px 14px rgba(183,28,28,0.4)" }}>
        <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={18} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">🛡️ Protection from Dajjal</h1>
          <p className="text-red-200 text-[10px]">حفاظت کی دعائیں · Essential Protections</p>
        </div>
      </div>
      <div className="px-3 pt-3 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 border-l-4" style={{ borderColor: "#C62828" }}>
            <p className="text-xs font-bold text-red-600 mb-2">{item.title}</p>
            <p className="text-right text-xl text-gray-800 mb-2 leading-loose" style={{ fontFamily: "'Amiri',serif" }}>{item.arabic}</p>
            <p className="text-right text-sm text-gray-600 mb-1" style={{ fontFamily: "'Amiri',serif", direction: "rtl" }}>{item.urdu}</p>
            <p className="text-xs text-gray-500 italic mb-1">{item.english}</p>
            <p className="text-[10px] text-red-400 font-semibold">Source: {item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================== CALENDAR =====================
const CalendarSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const events = [
    { month: "Muharram", day: 1, event: "Islamic New Year", urdu: "اسلامی نئے سال کا آغاز", importance: "high" },
    { month: "Muharram", day: 10, event: "Day of Ashura", urdu: "یوم عاشورا", importance: "high" },
    { month: "Rabi al-Awwal", day: 12, event: "Eid Milad-un-Nabi ﷺ", urdu: "عید میلاد النبی ﷺ", importance: "high" },
    { month: "Rajab", day: 27, event: "Isra and Miraj", urdu: "شب معراج", importance: "high" },
    { month: "Sha'ban", day: 15, event: "Shab-e-Barat", urdu: "شب برات", importance: "medium" },
    { month: "Ramadan", day: 1, event: "Start of Ramadan", urdu: "رمضان المبارک کا آغاز", importance: "high" },
    { month: "Ramadan", day: 27, event: "Laylat al-Qadr", urdu: "لیلۃ القدر", importance: "high" },
    { month: "Shawwal", day: 1, event: "Eid-ul-Fitr", urdu: "عید الفطر", importance: "high" },
    { month: "Dhul Hijjah", day: 9, event: "Day of Arafat", urdu: "یوم عرفہ", importance: "high" },
    { month: "Dhul Hijjah", day: 10, event: "Eid-ul-Adha", urdu: "عید الاضحیٰ", importance: "high" },
  ];
  return (
    <div className="page-content" style={{ background: "#e8eaf6" }}>
      <div className="sticky top-0 z-20 px-3 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#1A237E,#283593,#3949AB)", boxShadow: "0 3px 14px rgba(26,35,126,0.4)" }}>
        <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ChevronLeft size={18} color="white" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white">📅 Islamic Calendar 1448 AH</h1>
          <p className="text-indigo-200 text-[10px]">اسلامی تقویم · Important Dates</p>
        </div>
      </div>
      <div className="px-3 pt-3 space-y-2">
        {events.map((ev, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-3.5 flex items-center gap-3"
            style={{ borderLeft: `4px solid ${ev.importance === "high" ? "#3949AB" : "#7986CB"}` }}>
            <div className="text-center flex-shrink-0 w-12">
              <div className="text-lg font-extrabold" style={{ color: "#3949AB" }}>{ev.day}</div>
              <div className="text-[9px] text-gray-400 font-medium leading-tight">{ev.month.split(" ")[0]}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">{ev.event}</p>
              <p className="text-xs text-indigo-500" style={{ fontFamily: "'Amiri',serif" }}>{ev.urdu}</p>
            </div>
            {ev.importance === "high" && <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "#3949AB" }}>Key</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IHubPage;
