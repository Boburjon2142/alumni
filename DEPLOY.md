# Serverni yangilash

Server: `213.230.96.104:24050`, mavjud loyiha: `/var/www/alumni`.
SSH foydalanuvchisi: `root`; SSH porti: `24050`.
Avtomatik SSH ulanishi `Permission denied (publickey,password)` bilan rad etildi; parolni o?z terminalingizda kiriting.
Bu serverning Docker Compose/PostgreSQL konfiguratsiyasi hali tekshirilmagan; boshqa deployment usulida skriptni ishlatmang.
Serverga ushbu sessiyada hech qanday fayl yuklanmadi va production o‘zgartirilmadi.

## Tayyor paket bilan yangilash

Paket ishchi papkadagi so‘nggi kodni, jumladan hali commit qilinmagan o‘zgarishlarni o‘z ichiga oladi.
`.env`, lokal baza, yuklangan media, virtual muhit va `node_modules` paketga kiritilmaydi.
GitHub’ga push qilish shart emas. Serverdagi media va baza saqlanadi; lokal test profillari serverga ko‘chirilmaydi.

Loyiha ildizida PowerShell orqali:

```powershell
scp -P 24050 release/alumni-update.tar.gz release/alumni-update.tar.gz.sha256 scripts/deploy.sh root@213.230.96.104:~/
ssh -p 24050 -t root@213.230.96.104 'cd ~ && sha256sum -c alumni-update.tar.gz.sha256 && bash deploy.sh alumni-update.tar.gz /var/www/alumni'
```

SSH paroli yoki kaliti foydalanuvchining terminalida kiritiladi. Docker huquqi bo‘lmasa, server administratoridan SSH foydalanuvchisiga Docker huquqi kerak.

## Serverdagi `.env`

### Mavjud admin email va parollarini saqlash

Admin hisoblari PostgreSQL bazasidagi `accounts_user` jadvalida saqlanadi; parollar hash ko‘rinishida turadi.
Yangilangan `0004_ensure_admin_user` migratsiyasi mavjud hisobning paroli yoki huquqlarini almashtirmaydi.
Avval bajarilgan migratsiya qayta ishlamaydi; ilgari almashtirilgan parolni bu tuzatish avtomatik tiklamaydi.
Deploy bazani almashtirmaydi va `postgres_data` volume saqlanadi. `docker compose down -v`, `flush`,
lokal bazani serverga nusxalash yoki umumiy `loaddata` buyruqlarini ishlatmang.
Mavjud `.env`, `DJANGO_SECRET_KEY`, PostgreSQL sozlamalari va Compose loyiha nomini saqlang.
Lokal admin server bazasida yo‘q bo‘lsa, ushbu paket uni avtomatik ko‘chirmaydi.

Deploydan oldin va keyin serverda hisoblar ro‘yxatini tekshiring (parollar chiqarilmaydi):

```bash
cd /var/www/alumni
docker compose exec -T backend python manage.py shell -c 'from django.contrib.auth import get_user_model; from django.db.models import Q; print(list(get_user_model().objects.filter(Q(is_staff=True) | Q(is_superuser=True) | Q(role="admin")).values("email", "is_active", "is_staff", "is_superuser", "role")))'
```

Yangilashdan keyin domenning `/admin/login` sahifasida avvalgi email/parol bilan kiring.
Brauzer Network bo‘limida `/api/v1/admin/stats/` so‘rovi 200 qaytarishini tekshiring.
401/403 bo‘lsa sessiya, admin huquqlari va CSRF/domen sozlamalarini; 500 bo‘lsa backend logini tekshiring.
Dashboarddagi 0 raqamlari bazaning bo‘shligini tasdiqlamaydi: API xatosi ham alohida tekshirilishi kerak.

Serverning mavjud `.env` faylini saqlang. Lokal `.env` faylni serverga nusxalamang.
Quyidagi qiymatlar haqiqiy server ma’lumotlari bilan mavjud bo‘lishi kerak:

```dotenv
DJANGO_SECRET_KEY=<serverning mavjud maxfiy kaliti>
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,213.230.96.104,alumni.qarshidu.uz
CSRF_TRUSTED_ORIGINS=https://alumni.qarshidu.uz,http://213.230.96.104
FRONTEND_URL=https://alumni.qarshidu.uz
GOOGLE_CLIENT_ID=<Google Web application client ID>
EMAIL_HOST=<SMTP server>
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_USE_SSL=false
EMAIL_HOST_USER=<SMTP login>
EMAIL_HOST_PASSWORD=<SMTP password>
DEFAULT_FROM_EMAIL=<SMTP ruxsat bergan yuboruvchi email>
```

Yuqoridagi domen misol: haqiqiy domen boshqa bo‘lsa moslang. PostgreSQL login/parolini o‘zgartirmang.
`DJANGO_SECRET_KEY` yo‘q bo‘lsa skript deployni to‘xtatadi. Mavjud kalitni server administratoridan yoki ishlayotgan backend konfiguratsiyasidan saqlab oling.
HTTPS to‘liq ishlayotgan serverda `SESSION_COOKIE_SECURE=true`, `CSRF_COOKIE_SECURE=true` sozlang.
Google Cloud’dagi Authorized JavaScript origins ro‘yxatida haqiqiy HTTPS domen bo‘lishi kerak; localhost uchun berilgan ruxsat production domenga avtomatik o‘tmaydi.

## Skript bajaradigan ishlar

1. Mavjud Docker Compose loyihasi va PostgreSQL ishlayotganini tekshiradi.
2. Joriy kod/sozlamalarni zaxiralaydi va oldingi Docker image’larini rollback uchun saqlaydi.
3. Yangi kodni joylaydi, frontend/backend image’larini yaratadi. API proxy build vaqtida `backend:8000` ga bog‘lanadi.
4. Redis va baza healthchecklarini kutadi; Django va takroriy ism migratsiya talabini tekshiradi.
5. Yozuvlar o‘zgarmasligi uchun backend/frontendni vaqtincha to‘xtatadi; PostgreSQL dump va medianing to‘liq nusxasini oladi.
6. Migratsiyalar, static fayllar va keshni yangilaydi; servislarni ishga tushiradi.
7. API va frontendni tekshiradi. Xatoda eski kod/image’larni tiklashga urinadi.

Zaxira: `~/alumni-backups/YYYYMMDD-HHMMSS/`. Ushbu papkada maxfiy sozlamalar ham bor; uni ommaga ochmang.
`full_name` takrorlari topilsa skript to‘xtaydi: ismlar yoki profillarni avtomatik o‘chirmaydi va qayta nomlamaydi.
SQLite ishlatayotgan server uchun skript ataylab to‘xtaydi; alohida SQLite zaxiralash jarayoni talab qilinadi.
Paket Docker uchun 8005/3005 ichki server portlarini kutadi. Yangi serverda bu portlar va Nginx yo?naltirishi mosligini avval tekshiring. 24050 SSH porti bo?lsa uni sayt URL yoki CSRF origin sifatida ishlatmang.

## Tekshirish va rollback

```bash
cd /var/www/alumni
docker compose ps
docker compose logs --tail=100 backend frontend
curl -f http://127.0.0.1:8005/api/v1/alumni/groups/
curl -I http://127.0.0.1:3005/groups
```

Domen orqali Google/email kirishi, profil saqlash, guruhlar, murojaat va admin panelni tekshiring.
Google’ning haqiqiy hisob oynasi va emailning foydalanuvchi inboxiga yetib borishi lokal mock testlar bilan kafolatlanmaydi.

Qo‘lda rollback (deploy chiqargan aniq zaxira papkasini kiriting):

```bash
bash ~/alumni-backups/TIMESTAMP/rollback.sh ~/alumni-backups/TIMESTAMP /var/www/alumni
```

Rollback eski kod va image’larni tiklaydi; bazani/media’ni o‘chirmaydi, migratsiyalarni orqaga qaytarmaydi.
To‘liq database restore alohida administrator amali: yangi yozuvlarni yo‘qotishi mumkin, skript buni avtomatik bajarmaydi.

## Chegaralar

Lokal muhitda Docker yo‘q: image’larni yaratish va production tarmog‘i serverda tekshiriladi.
Deploy skripti production’da hali bajarilmagan; serverdagi holatni tekshiruvchi shartlar shuning uchun majburiy.
