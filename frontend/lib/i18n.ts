export const locales = ["uz", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

const dictionaries = {
  uz: {
    // Navigation
    navHome: "Bosh sahifa",
    navAlumni: "Faxriy bitiruvchilar",
    navStories: "Muvaffaqiyat hikoyalari",
    navAdvice: "Yoshlar uchun maslahatlar",
    navAbout: "Platforma haqida",
    navFeedback: "Taklif va savollar",
    university: "Qarshi davlat universiteti",
    brand: "QarDU Faxriy Bitiruvchilari",
    
    // Hero (UNTOUCHED)
    heroEyebrow: "QarDU Faxriy Bitiruvchilari",
    heroTitle: "QarDU faxri bo‘lgan",
    heroLine2: "yetuk bitiruvchilar",
    heroAccent: "va ularning tajribasi.",
    heroDescription: "Universitetimiz bitiruvchilarining hayot yo‘li, kasbiy yutuqlari va yosh avlod uchun qimmatli maslahatlari bilan tanishing.",
    heroCtaPrimary: "Faxriy bitiruvchilarni ko‘rish",
    heroCtaSecondary: "Maslahatlarni o‘qish",

    // Featured section
    featuredTitle: "Faxriy bitiruvchilar",
    featuredBadge: "Faxriy bitiruvchi",
    featuredSubtitle: "QarDU tarixida va jamiyat hayotida munosib iz qoldirgan bitiruvchilar bilan tanishing.",
    viewAllAlumni: "Barcha faxriy bitiruvchilar",
    featuredEmptyTitle: "Faxriy bitiruvchilar ro‘yxati shakllantirilmoqda",
    featuredEmptyText: "Universitet tahririyati tasdiqlagan profillar tez orada e’lon qilinadi.",

    // Success Stories section
    storiesTitle: "Muvaffaqiyat hikoyalari",
    storiesSubtitle: "QarDU bitiruvchilarining professional kamoloti va bosib o‘tgan ibratli yo‘li.",
    viewAllStories: "Barcha hikoyalar",
    readStory: "Hikoyani o‘qish",
    storyEyebrow: "Muvaffaqiyat hikoyasi",
    studentTakeaway: "Talabalar uchun xulosa",
    storiesEmptyTitle: "Hikoyalar tayyorlanmoqda",
    storiesEmptyText: "Tahririyat tomonidan yangi maqolalar yozilmoqda.",
    backToStories: "Barcha hikoyalarga qaytish",
    authorProfile: "Bitiruvchi profili",

    // Advice section
    adviceTitle: "Yoshlar uchun maslahatlar",
    adviceSubtitle: "Katta hayot va kasbiy faoliyatda sinalgan amaliy tavsiyalar.",
    viewAllAdvice: "Barcha maslahatlar",
    adviceEmptyTitle: "Maslahatlar tayyorlanmoqda",
    adviceEmptyText: "Bitiruvchilarning tavsiyalari tahririyat tomonidan joylashtirilmoqda.",

    // Categories
    allCategories: "Barchasi",
    catEducation: "Ta’lim",
    catCareer: "Karyera",
    catLeadership: "Liderlik",
    catWork: "Mehnat",
    catGrowth: "Shaxsiy rivojlanish",
    catScience: "Ilm-fan",
    catSociety: "Jamiyat",
    catExperience: "Hayotiy tajriba",
    catDiscipline: "Intizom",
    catMedia: "Media va OAV",
    catEngineering: "Muhandislik",
    catCulture: "Madaniyat va meros",
    catBusiness: "Biznes",
    catAcademic: "Akademik",
    catCommunity: "Jamiyat",
    catLaw: "Huquqshunoslik",

    // Feedback & Inquiries
    feedbackTitle: "Taklif va savollar",
    feedbackSubtitle: "Platforma ma’lumotlari, xatoliklar yoki yangi takliflar bo‘yicha universitet ma’muriyatiga murojaat yo‘llang.",
    feedbackType: "Murojaat turi",
    feedbackTypeQuestion: "Savol",
    feedbackTypeProposal: "Taklif",
    feedbackTypeError: "Ma’lumotdagi xato",
    feedbackTypeAddInfo: "Qo‘shimcha ma’lumot",
    feedbackTypeOther: "Boshqa",
    feedbackName: "Ismingiz (ixtiyoriy)",
    feedbackContact: "Aloqa ma’lumotingiz (email yoki telefon)",
    feedbackContactHint: "Javob olishni istasangiz aloqa ma’lumotingizni kiriting.",
    feedbackMessage: "Xabar matni",
    feedbackMessagePlaceholder: "Fikringiz, taklifingiz yoki tuzatishingizni yozing...",
    feedbackSubmit: "Murojaatni yuborish",
    feedbackSending: "Yuborilmoqda...",
    feedbackSuccessTitle: "Murojaatingiz qabul qilindi",
    feedbackSuccessText: "Taklif va fikringiz uchun rahmat. Administratorlar murojaatingizni ko‘rib chiqadi.",
    feedbackSendAnother: "Yana murojaat yuborish",
    feedbackError: "Xatolik yuz berdi. Iltimos, ma’lumotlarni tekshirib qayta urinib ko‘ring.",

    // Legacy Section
    legacyTitle: "Akademik an’ana va yuksak salohiyat",
    legacyText: "1956-yildan buyon Qarshi davlat universiteti minglab yetuk mutaxassislar, olimlar, davlat va jamoat arboblarini tarbiyalab kelmoqda. Bu platforma ularning boy merosi va tajribasini jamlovchi rasmiy arxivdir.",
    legacyPoint1Title: "Ilmiy va kasbiy meros",
    legacyPoint1Text: "Turli davrlarda ta’lim olgan bitiruvchilarning ilmiy maktabi va amaliy yutuqlari.",
    legacyPoint2Title: "Avlodlar vorisiyligi",
    legacyPoint2Text: "Tajribali ustozlarning yosh talabalar va yangi mutaxassislarga yo‘l-yo‘riqlari.",
    legacyPoint3Title: "Ishonchli va tasdiqlangan manbalar",
    legacyPoint3Text: "Har bir ma’lumot universitet tahririyati va rasmiy manbalar orqali tekshiriladi.",

    // Final CTA
    finalCtaTitle: "Faxriy bitiruvchilar bilan tanishing",
    finalCtaText: "QarDU bitiruvchilarining professional profillari va tavsiyalarini o‘rganing.",
    finalCtaButton: "Katalogni ochish",

    // Directory / Catalogue
    directoryTitle: "Faxriy bitiruvchilar katalogi",
    directoryText: "Qarshi davlat universitetining turli sohalarda e’tibor qozongan bitiruvchilari bilan tanishing.",
    searchPlaceholder: "Ism, lavozim yoki tashkilot bo‘yicha qidiring...",
    search: "Qidirish",
    filters: "Filtrlar",
    faculty: "Fakultet",
    allFaculties: "Barcha fakultetlar",
    year: "Bitiruv yili",
    allYears: "Barcha yillar",
    clearFilters: "Filtrlarni tozalash",
    results: "Natijalarni ko‘rish",
    found: "ta bitiruvchi topildi",
    noResults: "Faxriy bitiruvchilar topilmadi",
    noResultsText: "Qidiruv yoki filtr parametrlarini o‘zgartirib ko‘ring.",
    previous: "Oldingi",
    next: "Keyingi",

    // Profile Detail
    overview: "Qisqacha tavsif",
    timeline: "Hayot va kasbiy yo‘l",
    achievements: "Asosiy yutuqlar",
    ksuConnection: "QarDUdagi ta’lim davri",
    alumniAdvice: "Yoshlar uchun maslahatlar",
    verifiedSources: "Tasdiqlangan manbalar",
    fullProfile: "Batafsil profil",
    quickView: "Profilni ko‘rish",
    graduate: "QarDU bitiruvchisi",
    verified: "Tasdiqlangan",
    backToDirectory: "Faxriy bitiruvchilarga qaytish",
    profileNotFound: "Bitiruvchi profili topilmadi",
    profileNotFoundText: "Ushbu profil mavjud emas yoki nashr qilinmagan.",

    // About Page
    aboutTitle: "Platforma haqida",
    aboutSubtitle: "Qarshi davlat universitetining faxriy bitiruvchilarini tanishtiruvchi rasmiy raqamli platforma.",
    aboutMissionTitle: "Loyiha maqsadi",
    aboutMissionText: "Ushbu platformaning bosh maqsadi — Qarshi davlat universitetining jamiyat, ilm-fan, davlat boshqaruvi va iqtisodiyot rivojiga ulkan hissa qo‘shgan faxriy bitiruvchilarini xalqimiz va yosh avlodga tanishtirish, ularning tajribasini universitetning akademik merosi sifatida saqlashdir.",
    aboutEditorialTitle: "Tahririyat va saralash mezonlari",
    aboutEditorialText: "Platformadagi barcha profillar universitet ma’muriyati va tahririyat kengashi tomonidan rasmiy hujjatlar, ochiq ilmiy nashrlar va tasdiqlangan manbalar asosida shakllantiriladi.",
    aboutTrustTitle: "Ishonchlilik va manbalar",
    aboutTrustText: "Har bir fakt, erishilgan yutuq va bosqichlar tekshirilgan manbalarga tayanadi. Platformada tasdiqlanmagan yoki asossiz ma’lumotlar e’lon qilinmaydi.",

    // Privacy & Legal
    privacyTitle: "Maxfiylik va ishonchlilik siyosati",
    privacyText: "Platforma faqat ochiq, professional va tahririyat tomonidan tasdiqlangan ma’lumotlarni nashr etadi. Shaxsiy aloqa ma’lumotlari (shaxsiy telefon, yopiq email, uy manzili) ommaga e’lon qilinmaydi.",
    footerText: "Qarshi davlat universitetining faxriy bitiruvchilari rasmiy raqamli arxivi.",
    copyright: "Barcha huquqlar himoyalangan.",
    loadError: "Ma’lumotlarni yuklab bo‘lmadi",
    retryText: "Iltimos, sahifani yangilang yoki birozdan so‘ng qayta urinib ko‘ring.",
    notFound: "Sahifa topilmadi",
    notFoundText: "Siz qidirayotgan sahifa mavjud emas yoki o‘chirilgan.",
  },

  ru: {
    // Navigation
    navHome: "Главная",
    navAlumni: "Почётные выпускники",
    navStories: "Истории успеха",
    navAdvice: "Советы молодёжи",
    navAbout: "О платформе",
    navFeedback: "Предложения и вопросы",
    university: "Каршинский государственный университет",
    brand: "Почётные выпускники КарГУ",
    
    // Hero
    heroEyebrow: "Почётные выпускники КарГУ",
    heroTitle: "Гордость КарГУ —",
    heroLine2: "лучшие выпускники",
    heroAccent: "и их путь к успеху.",
    heroDescription: "Жизненный путь, достижения и ценные советы выпускников Каршинского государственного университета.",
    heroCtaPrimary: "Смотреть выпускников",
    heroCtaSecondary: "Читать советы",

    // Featured section
    featuredTitle: "Почётные выпускники",
    featuredBadge: "Почётный выпускник",
    featuredSubtitle: "Выпускники, внёсшие достойный вклад в историю КарГУ и развитие общества.",
    viewAllAlumni: "Все почётные выпускники",
    featuredEmptyTitle: "Список выпускников формируется",
    featuredEmptyText: "Профили, утверждённые редакцией университета, будут опубликованы в ближайшее время.",

    // Success Stories section
    storiesTitle: "Истории успеха",
    storiesSubtitle: "Профессиональный рост и вдохновляющий путь выдающихся выпускников КарГУ.",
    viewAllStories: "Все истории",
    readStory: "Читать историю",
    storyEyebrow: "История успеха",
    studentTakeaway: "Главный вывод для студентов",
    storiesEmptyTitle: "Истории подготавливаются",
    storiesEmptyText: "Редакция готовит новые вдохновляющие материалы.",
    backToStories: "Вернуться ко всем историям",
    authorProfile: "Профиль выпускника",

    // Advice section
    adviceTitle: "Советы молодёжи",
    adviceSubtitle: "Практические рекомендации, проверенные реальным жизненным и карьерным опытом.",
    viewAllAdvice: "Все советы",
    adviceEmptyTitle: "Советы подготавливаются",
    adviceEmptyText: "Рекомендации выпускников публикуются редакцией.",

    // Categories
    allCategories: "Все",
    catEducation: "Образование",
    catCareer: "Карьера",
    catLeadership: "Лидерство",
    catWork: "Труд",
    catGrowth: "Личностный рост",
    catScience: "Наука",
    catSociety: "Общество",
    catExperience: "Жизненный опыт",
    catDiscipline: "Дисциплина",
    catMedia: "Медиа и СМИ",
    catEngineering: "Инженерия",
    catCulture: "Культура и наследие",
    catBusiness: "Бизнес",
    catAcademic: "Академическая сфера",
    catCommunity: "Общество",
    catLaw: "Юриспруденция",

    // Feedback & Inquiries
    feedbackTitle: "Предложения и вопросы",
    feedbackSubtitle: "Направьте обращение руководству университета по поводу информации на платформе, ошибок или предложений.",
    feedbackType: "Тип обращения",
    feedbackTypeQuestion: "Вопрос",
    feedbackTypeProposal: "Предложение",
    feedbackTypeError: "Ошибка в информации",
    feedbackTypeAddInfo: "Дополнительные сведения",
    feedbackTypeOther: "Другое",
    feedbackName: "Ваше имя (необязательно)",
    feedbackContact: "Контакты (email или телефон)",
    feedbackContactHint: "Укажите контакты, если хотите получить ответ.",
    feedbackMessage: "Текст сообщения",
    feedbackMessagePlaceholder: "Напишите ваши мысли, предложения или исправления...",
    feedbackSubmit: "Отправить обращение",
    feedbackSending: "Отправка...",
    feedbackSuccessTitle: "Ваше обращение принято",
    feedbackSuccessText: "Спасибо за ваше предложение и отзыв. Администрация рассмотрит ваше обращение.",
    feedbackSendAnother: "Отправить ещё одно обращение",
    feedbackError: "Произошла ошибка. Пожалуйста, проверьте данные и попробуйте снова.",

    // Legacy Section
    legacyTitle: "Академические традиции и высокий потенциал",
    legacyText: "С 1956 года Каршинский государственный университет воспитал тысячи специалистов, учёных, государственных и общественных деятелей.",
    legacyPoint1Title: "Научное и профессиональное наследие",
    legacyPoint1Text: "Научная школа и практические достижения выпускников разных эпох.",
    legacyPoint2Title: "Преемственность поколений",
    legacyPoint2Text: "Наставления опытных учителей молодым студентам и исследователям.",
    legacyPoint3Title: "Надёжные и проверенные источники",
    legacyPoint3Text: "Каждая информация проверяется редакцией университета и официальными источниками.",

    // Final CTA
    finalCtaTitle: "Познакомьтесь с почётными выпускниками",
    finalCtaText: "Изучите профессиональные профили и советы выпускников КарГУ.",
    finalCtaButton: "Открыть каталог",

    // Directory / Catalogue
    directoryTitle: "Каталог почётных выпускников",
    directoryText: "Познакомьтесь с выпускниками Каршинского государственного университета, добившимися признания в различных сферах.",
    searchPlaceholder: "Поиск по имени, должности или организации...",
    search: "Поиск",
    filters: "Фильтры",
    faculty: "Факультет",
    allFaculties: "Все факультеты",
    year: "Год выпуска",
    allYears: "Все годы",
    clearFilters: "Сбросить фильтры",
    results: "Показать результаты",
    found: "выпускников найдено",
    noResults: "Выпускники не найдены",
    noResultsText: "Попробуйте изменить параметры поиска или фильтров.",
    previous: "Назад",
    next: "Вперёд",

    // Profile Detail
    overview: "Краткий обзор",
    timeline: "Карьерный и жизненный путь",
    achievements: "Основные достижения",
    ksuConnection: "Период обучения в КарГУ",
    alumniAdvice: "Советы молодёжи",
    verifiedSources: "Проверенные источники",
    fullProfile: "Полный профиль",
    quickView: "Просмотр профиля",
    graduate: "Выпускник КарГУ",
    verified: "Подтверждён",
    backToDirectory: "Вернуться к выпускникам",
    profileNotFound: "Профиль не найден",
    profileNotFoundText: "Данный профиль не существует или не опубликован.",

    // About Page
    aboutTitle: "О платформе",
    aboutSubtitle: "Официальная цифровая платформа, представляющая почётных выпускников Каршинского государственного университета.",
    aboutMissionTitle: "Цель проекта",
    aboutMissionText: "Главная цель этой платформы — представить народу и молодому поколению выдающихся выпускников Каршинского государственного университета, внёсших огромный вклад в развитие общества, науки, государственного управления и экономики.",
    aboutEditorialTitle: "Редакционные критерии отбора",
    aboutEditorialText: "Все профили формируются администрацией университета и редакционным советом на основе официальных документов, открытых научных публикаций и подтверждённых источников.",
    aboutTrustTitle: "Достоверность и источники",
    aboutTrustText: "Каждый факт, достижение и этап биографии опирается на проверенные данные. Недостоверные сведения не публикуются.",

    // Privacy & Legal
    privacyTitle: "Политика конфиденциальности и доверия",
    privacyText: "Платформа публикует исключительно открытые, профессиональные и подтверждённые редакцией сведения. Личные контакты не публикуются.",
    footerText: "Официальный цифровой архив почётных выпускников Каршинского государственного университета.",
    copyright: "Все права защищены.",
    loadError: "Не удалось загрузить данные",
    retryText: "Пожалуйста, обновите страницу или повторите попытку позже.",
    notFound: "Страница не найдена",
    notFoundText: "Запрашиваемая страница не существует или была удалена.",
  },

  en: {
    // Navigation
    navHome: "Home",
    navAlumni: "Honorary Alumni",
    navStories: "Success Stories",
    navAdvice: "Youth Advice",
    navAbout: "About Platform",
    navFeedback: "Feedback & Inquiries",
    university: "Karshi State University",
    brand: "KarSU Honorary Alumni",
    
    // Hero
    heroEyebrow: "KarSU Honorary Alumni",
    heroTitle: "Pride of KarSU —",
    heroLine2: "our finest alumni",
    heroAccent: "and their legacy.",
    heroDescription: "Career journeys, achievements, and valuable insights of Karshi State University alumni for future generations.",
    heroCtaPrimary: "Explore Alumni",
    heroCtaSecondary: "Read Advice",

    // Featured section
    featuredTitle: "Honorary Alumni",
    featuredBadge: "Honorary Alumnus",
    featuredSubtitle: "Meet alumni who have left an indelible mark on KarSU history and societal progress.",
    viewAllAlumni: "All Honorary Alumni",
    featuredEmptyTitle: "Alumni roster is being compiled",
    featuredEmptyText: "Profiles verified by the university editorial board will be published shortly.",

    // Success Stories section
    storiesTitle: "Success Stories",
    storiesSubtitle: "In-depth editorial articles highlighting distinguished career milestones of KarSU alumni.",
    viewAllStories: "All Stories",
    readStory: "Read Story",
    storyEyebrow: "Success Story",
    studentTakeaway: "Key Takeaway for Students",
    storiesEmptyTitle: "Stories in preparation",
    storiesEmptyText: "New inspiring long-form stories are being crafted by the editorial board.",
    backToStories: "Back to all stories",
    authorProfile: "Alumnus Profile",

    // Advice section
    adviceTitle: "Advice for Youth",
    adviceSubtitle: "Practical insights and time-tested reflections from distinguished alumni.",
    viewAllAdvice: "All Advice",
    adviceEmptyTitle: "Advice in preparation",
    adviceEmptyText: "Alumni recommendations are being published by the editorial board.",

    // Categories
    allCategories: "All",
    catEducation: "Education",
    catCareer: "Career",
    catLeadership: "Leadership",
    catWork: "Hard Work",
    catGrowth: "Personal Growth",
    catScience: "Science",
    catSociety: "Society",
    catExperience: "Life Experience",
    catDiscipline: "Discipline",
    catMedia: "Media & Journalism",
    catEngineering: "Engineering",
    catCulture: "Culture & Heritage",
    catBusiness: "Business",
    catAcademic: "Academic",
    catCommunity: "Community",
    catLaw: "Law & Justice",

    // Feedback & Inquiries
    feedbackTitle: "Feedback & Inquiries",
    feedbackSubtitle: "Submit suggestions, error reports, or questions directly to the university administration.",
    feedbackType: "Inquiry Type",
    feedbackTypeQuestion: "Question",
    feedbackTypeProposal: "Proposal",
    feedbackTypeError: "Information Error",
    feedbackTypeAddInfo: "Additional Information",
    feedbackTypeOther: "Other",
    feedbackName: "Your Name (Optional)",
    feedbackContact: "Contact info (email or phone)",
    feedbackContactHint: "Provide contact details if you would like a reply.",
    feedbackMessage: "Message Text",
    feedbackMessagePlaceholder: "Enter your thoughts, suggestion, or correction...",
    feedbackSubmit: "Submit Inquiry",
    feedbackSending: "Sending...",
    feedbackSuccessTitle: "Inquiry Received",
    feedbackSuccessText: "Thank you for your feedback. Our administration will review your submission.",
    feedbackSendAnother: "Send Another Inquiry",
    feedbackError: "An error occurred. Please verify your information and try again.",

    // Legacy Section
    legacyTitle: "Academic Tradition & Distinction",
    legacyText: "Since 1956, Karshi State University has nurtured thousands of prominent scholars, leaders, and pioneers.",
    legacyPoint1Title: "Scholarly Legacy",
    legacyPoint1Text: "Scientific schools and practical achievements of alumni across decades.",
    legacyPoint2Title: "Mentorship & Continuity",
    legacyPoint2Text: "Time-tested insights passed down from senior masters to aspiring students.",
    legacyPoint3Title: "Verified Records",
    legacyPoint3Text: "Every entry is confirmed through official university archives and public records.",

    // Final CTA
    finalCtaTitle: "Connect With Our Alumni Legacy",
    finalCtaText: "Explore verified career paths, published insights, and leadership advice.",
    finalCtaButton: "Open Directory",

    // Directory / Catalogue
    directoryTitle: "Honorary Alumni Directory",
    directoryText: "Discover distinguished graduates of Karshi State University who have shaped industry, academia, and society.",
    searchPlaceholder: "Search by name, role, or organization...",
    search: "Search",
    filters: "Filters",
    faculty: "Faculty",
    allFaculties: "All Faculties",
    year: "Graduation Year",
    allYears: "All Years",
    clearFilters: "Clear Filters",
    results: "View Results",
    found: "alumni found",
    noResults: "No alumni found",
    noResultsText: "Try adjusting your search query or filter criteria.",
    previous: "Previous",
    next: "Next",

    // Profile Detail
    overview: "Overview",
    timeline: "Career Timeline",
    achievements: "Major Honors & Awards",
    ksuConnection: "KarSU Academic Period",
    alumniAdvice: "Advice for Students",
    verifiedSources: "Verified Sources",
    fullProfile: "Full Profile",
    quickView: "Quick Profile",
    graduate: "KarSU Alumnus",
    verified: "Verified",
    backToDirectory: "Back to Directory",
    profileNotFound: "Alumnus Profile Not Found",
    profileNotFoundText: "This profile does not exist or has not been published.",

    // About Page
    aboutTitle: "About Platform",
    aboutSubtitle: "The official digital platform honoring distinguished alumni of Karshi State University.",
    aboutMissionTitle: "Project Mission",
    aboutMissionText: "The primary mission is to document and celebrate alumni who have contributed significantly to society, academia, state governance, and economy.",
    aboutEditorialTitle: "Editorial & Curation Standards",
    aboutEditorialText: "All biographical records are curated by the university editorial council based on official records and verified sources.",
    aboutTrustTitle: "Integrity & Trust",
    aboutTrustText: "Every achievement is backed by reliable documentation. Unverified claims are strictly omitted.",

    // Privacy & Legal
    privacyTitle: "Privacy & Reliability Policy",
    privacyText: "The platform publishes only verified public information. Personal contact information remains strictly confidential.",
    footerText: "Official digital archive of Karshi State University honorary alumni.",
    copyright: "All rights reserved.",
    loadError: "Failed to load data",
    retryText: "Please refresh the page or try again in a few moments.",
    notFound: "Page Not Found",
    notFoundText: "The page you are looking for does not exist or has been moved.",
  },
} as const;

export type Dictionary = { [K in keyof (typeof dictionaries)["uz"]]: string };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.uz;
}

export async function getLocale(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const value = cookieStore.get("NEXT_LOCALE")?.value as Locale;
  return locales.includes(value) ? value : "uz";
}

export function getCategoryLabel(category: string, locale: Locale): string {
  const t = getDictionary(locale);
  const normalized = category.toLowerCase().replace(/[-_]/g, "");
  
  const map: Record<string, keyof Dictionary> = {
    media: "catMedia",
    engineering: "catEngineering",
    culture: "catCulture",
    business: "catBusiness",
    academic: "catAcademic",
    community: "catCommunity",
    society: "catSociety",
    law: "catLaw",
    career: "catCareer",
    education: "catEducation",
    study: "catEducation",
    leadership: "catLeadership",
    personalgrowth: "catGrowth",
    growth: "catGrowth",
    work: "catWork",
    science: "catScience",
    life: "catExperience",
    experience: "catExperience",
    discipline: "catDiscipline",
  };

  const key = map[normalized];
  if (key && key in t) {
    return t[key];
  }
  return category;
}
