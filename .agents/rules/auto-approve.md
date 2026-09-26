# Auto-approve qoidalari

> Dizayn bo‘yicha majburiy istisno: loyiha ildizidagi `AGENTS.md` qoidasiga amal qilinsin. Mavjud dizayn va ko‘rinish faqat foydalanuvchi aniq so‘raganda, faqat so‘ralgan doirada o‘zgartiriladi. Quyidagi avtomatik ruxsatlar bu cheklovni bekor qilmaydi.

- Fayllarni o'qish, yozish va o'zgartirish uchun ruxsat so'rama — avtomatik bajar.
- Terminal buyruqlarini ishga tushirishdan oldin ruxsat so'rama — avtomatik bajar.
- Serverlarni ishga tushirish yoki to'xtatish uchun ruxsat so'rama.
- Git operatsiyalari (fetch, pull, status) uchun ruxsat so'rama.
- Faqat quyidagilarda ruxsat so'ra:
  - Ma'lumotlar bazasini o'chirish (DROP, TRUNCATE)
  - Production serverga to'g'ridan-to'g'ri o'zgartirish
  - `.env` fayldagi maxfiy kalitlarni o'chirish
