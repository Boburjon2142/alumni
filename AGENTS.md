# Coding agentlar uchun majburiy loyiha qoidalari

Ushbu qoidalar loyiha ildizi va barcha ichki papkalarga tatbiq etiladi.

## Mavjud dizaynni saqlash — qat'iy talab

Foydalanuvchi hozirgacha yaratilgan dizayn va ko‘rinishlarni saqlashni buyurgan.
**Foydalanuvchining aniq topshirig‘isiz mavjud dizaynni yoki ko‘rinishni o‘zgartirish TAQIQLANADI.**

- Sahifa tuzilishi, kartalar, modal oynalar, navigatsiya, filtrlar, formalar, tugmalar va ularning joylashuvi saqlansin.
- Ranglar, shriftlar, matn o‘lchamlari, oraliqlar, kenglik/balandlik, ustunlar, chegaralar, soyalar, yumaloqlik, ikonalar, rasmlar va rasmlarning kesilishi o‘zgartirilmasin.
- Mobil, planshet va desktop ko‘rinishlari, breakpointlar, animatsiyalar va vizual holatlar ham himoyalangan.
- “Yaxshilash”, “zamonaviylashtirish”, “refaktor”, “optimallashtirish”, “tozalash”, “birxillashtirish” yoki agentning shaxsiy didi dizaynni o‘zgartirish uchun ruxsat emas.
- Backend, API, ma’lumotlar, test yoki funksional xatolar bo‘yicha topshiriq dizaynni o‘zgartirishga ruxsat bermaydi. Bunday ishlar mavjud ko‘rinishni saqlagan holda bajarilsin.
- CSS, JSX/TSX, umumiy komponentlar, assetlar, kutubxonalar yoki sozlamalarni bilvosita o‘zgartirib ham ko‘rinishni buzish mumkin emas.

## Qachon o‘zgartirish mumkin

- Faqat foydalanuvchi muayyan dizayn yoki ko‘rinishni o‘zgartirishni aniq so‘raganda.
- Ruxsat faqat so‘ralgan element, sahifa va o‘zgarish doirasiga tegishli. Bir kartani o‘zgartirish topshirig‘i butun saytni qayta dizayn qilishga ruxsat emas.
- Oldingi bajarilgan dizayn topshirig‘i kelajakdagi boshqa o‘zgarishlar uchun doimiy ruxsat hisoblanmaydi.
- Agar funksional vazifa muqarrar ravishda ko‘rinishni o‘zgartirishni talab qilsa va foydalanuvchi bunga ruxsat bermagan bo‘lsa, avval aynan qaysi ko‘rinish nima sababdan o‘zgarishini tushuntirib, aniq ruxsat olinsin. Javob kelmaguncha shu o‘zgarish bajarilmasin; mustaqil funksional ishlar davom ettirilishi mumkin.

## Ishlash va tekshirish tartibi

- O‘zgartirishdan oldin tegishli kod va mavjud ko‘rinish o‘rganilsin; ishchi papkadagi foydalanuvchi o‘zgarishlari saqlansin.
- Umumiy CSS yoki umumiy komponent o‘zgartirilsa, u ishlatiladigan boshqa sahifalarga ta’siri tekshirilsin. Ruxsat doirasidan tashqariga vizual o‘zgarish tarqalmasin.
- Ruxsat etilgan vizual ishlar desktop va mobil o‘lchamlarda imkon qadar tekshirilsin. Vizual tekshiruv bajarilmagan bo‘lsa, yakuniy javobda bu ochiq aytilsin; unit testlar vizual tekshiruv o‘rnini bosmaydi.
- Agent kiritgan tasodifiy vizual o‘zgarish aniqlansa, foydalanuvchining boshqa ishlarini bekor qilmasdan faqat shu tasodifiy o‘zgarish qaytarilsin.
- Ushbu cheklov foydalanuvchi aniq so‘ramaguncha o‘chirilmasin, yumshatilmasin yoki chetlab o‘tilmasin.

## Boshqa mahalliy qoidalar bilan munosabat

Fayllarni avtomatik tahrirlash, buyruqlarni ruxsatsiz bajarish yoki avtonom ishlash haqidagi mahalliy qoidalar dizaynni o‘zgartirishga ruxsat bermaydi. `.agents/rules/auto-approve.md` va dizayn workflowlari ushbu cheklov doirasida qo‘llanadi.
