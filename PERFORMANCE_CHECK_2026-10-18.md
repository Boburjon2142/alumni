# Tezlik va mobil tekshiruv — 2026-10-18

## O'zgarishlar

- Kartalarda va unvonlar galereyasida asl PNG o'rniga ekran zichligiga mos
  80/160/480px WebP yuklanadi. Asl fayllar va API qaytaradigan fayl nomlari
  o'zgarmadi. Nusxalar lossless kodlangan; qayta yaratish buyrug'i:
  `cd frontend` va `node scripts/recognition-images.cjs`.
- Rasmlarga lazy loading va async decoding qo'shildi; mavjud width/height
  saqlanadi. WebP yuklanmasa original PNG ishlatiladi.
- Bir vaqtda yuborilgan brauzer sessiya so'rovlari bitta so'rovni bo'lishadi.
  Tugagan so'rov keshlanmaydi, xatodan so'ng qayta urinish mumkin, login/logout
  kutayotgan so'rovni bekor manba sifatida ajratadi. Serverda foydalanuvchilar
  orasida sessiya natijalari bo'lishilmaydi.
- CSS, breakpointlar, kartalar geometriyasi va content-width tokenlari o'zgarmadi.

## O'lchov va tekshiruv

Lokal Edge/Playwright, 390px viewport, DPR 1:

- Asl unvon PNG: taxminan 1.9–2.0 MB/fayl.
- 40px kartadagi WebP: 13,058–14,126 bayt/fayl (99% atrofida kichikroq).
- Galereyadagi 160px WebP: 40,204–44,846 bayt/fayl.
- Bosh sahifa sessiya so'rovlari: 3 → 1.
- /impact sahifasi sessiya so'rovlari: 5 → 2.

Bu rasm trafik o'lchovi; butun sahifa tezligi yoki production Core Web Vitals
natijasi deb talqin qilinmasin.

- 129 frontend testi muvaffaqiyatli o'tdi, shu jumladan concurrent sessiya,
  fresh CSRF, login/logout va rasm fallback holatlari.
- Production build o'tdi. Mavjud autoprefixer start/end ogohlantirishlari bor.
- 12 ommaviy marshrut × 8 kenglik (320, 390, 640, 768, 1024, 1280, 1440,
  1920px): 96 holat, hammasi HTTP 200, document overflow 0, pageerror yo'q.
- 320×568, 390×844 DPR3, 844×390 DPR2, 768×1024 DPR2 va 1024×768:
  kirish modali viewport ichida, unvon modali scrolli oxirigacha ishlaydi;
  mobil menyu va Escape orqali yopish ishlaydi. DPR3 ekranda 480px variant tanlandi.
- 390px va 1440px bosh sahifa/galereya oldin-keyin suratlari olindi;
  o'lchamlari bir xil. Mobil galereya va bosh sahifa suratlari ko'zdan kechirildi.
- Dalillar: ignored `tmp/perf-before.json`, `tmp/perf-after.json`,
  `tmp/perf-mobile-interactions.json`, `tmp/responsive-20261018-results.json`
  va `tmp/perf-*.png` fayllari.

Haqiqiy iOS/Safari va Android qurilmalarda tekshirilmadi. Ushbu o'zgarishlar
lokalda bajarildi; productionga deploy yoki ma'lumot importi bajarilmadi.
