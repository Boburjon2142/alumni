# Responsivlik tekshiruvi — 2026-10-18

Lokal Playwright va o'rnatilgan Edge orqali haqiqiy brauzer renderi tekshirildi. Foydalanuvchi Playwright ishlatishga aniq ruxsat berdi. Server/production bu tekshiruvga kirmaydi.

- 320, 390, 640, 768, 1024, 1280, 1440 va 1920px: 12 sahifa, jami 96 holat.
- Sahifalar: /, /alumni, /groups, /groups/2025, /stories, /interviews, /news, /join, /impact, /impact/recognized, /feedback, /profile.
- Ushbu 96 holatda gorizontal document overflow va JavaScript pageerror aniqlanmadi.
- uz/ru/en bilan 320, 768, 901 va 1440px da bosh sahifa, alumni va e'tirof ro'yxati: yana 36 holat. HTML tili mos, document overflow yo'q.
- Admin alumni, intervyu, faoliyat yo'li va maslahat sahifalari 320, 390, 768, 1024 va 1440px da tekshirildi. Jadvallarning ichki gorizontal skrolli ataylab saqlangan; sahifaning o'zi toshmadi.
- Intervyu tahrirlash oynasi 320x568, 390x900, 768x900, 1024x900 va 1440x900 da tekshirildi: oyna viewport ichida, skroll oxiriga va Saqlash tugmasiga yetib borildi.
- Desktop menyu dropdownlari 901, 1024 va 1280px da viewport ichida ochildi.
- Mobil menyu ochiq paytda desktopga o'tilganda eski ochiq holat va body scroll lock qolishi qayta ishlab chiqarildi va tuzatildi. Admin yon menyusining resize holati ham tuzatildi; qayta tekshiruvda backdrop va ochiq drawer qolmadi.
- Mobil va desktop bosh sahifa, alumni ro'yxati, admin jadvali va intervyu oynasi screenshotlari ko'zdan kechirildi.
- 126 frontend testi va TypeScript tekshiruvi o'tdi.

Tasdiqlangan ranglar, shriftlar va umumiy 1760px/64px/32px kontent kengligi tokenlari saqlandi. Avvalgi topshiriqda alumni admin jadvali ixchamlashtirildi, tor ekran filtrlari va modal skrollari moslashtirildi.

Screenshot va JSON natijalar `tmp/responsive-20261018-*` ichida lokal saqlangan; vaqtinchalik autentifikatsiya sessiyasi va uning kalit fayli tekshiruv tugagach o'chirildi. Ular GitHubga kiritilmaydi.

Bu natijalar Chromium/Edge renderiga tegishli. Haqiqiy iPhone Safari, Android qurilmalari, barcha kontent variantlari va yuklama testi bajarilmadi; tekshiruv ularning barchasini kafolatlamaydi.
