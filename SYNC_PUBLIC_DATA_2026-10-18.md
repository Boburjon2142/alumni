# Lokal ommaviy kontentni PM2 serveriga ko'chirish

2026-10-18 tekshiruvda productionda 12 faxriy profil va 17 unvon turi bor, lekin profillarga biriktirilgan unvonlar soni 0 edi. Lokal eksportda 12 faxriy profil, 45 tasdiqlangan unvon biriktirishi, 12 nashr qilingan yangilik va 24 rasm mavjud. Faoliyat yo'llari, intervyular, maslahatlar, ta'lim/ish tarixi ham profil snapshotida bor. Qoralama intervyu qoralama holatida qoladi.

Git pull kodni oladi; bazadagi kontentni qo'llash uchun quyidagi alohida import kerak. Import serverdagi mos public maydonlarni lokal nusxa bilan yangilaydi. Akkauntlar, parollar, kontaktlar va staff bog'lanishlari ko'chirilmaydi/almashtirilmaydi. Snapshotga kirmagan profil va yangiliklar o'chirilmaydi. Yangiliklar ko'rilish statistikasi ko'chirilmaydi. Lokal namuna unvonlarining `LOKAL NAMUNA` izohi saqlanadi.

Serverda `/var/www/alumni` ichida, bitta terminalda:

## 1. Zaxira

```bash
cd /var/www/alumni
umask 077
backup="$HOME/alumni-backups/public-sync-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"
backend/venv312/bin/python backend/manage.py dumpdata --all > "$backup/data.json"
test -s "$backup/data.json"
tar -czf "$backup/media.tar.gz" -C backend media
echo "Zaxira: $backup"
```

Buyruqlardan biri xato bersa, keyingi bosqichni bajarmang. Zaxira private ma'lumotlarni ham saqlaydi: uni GitHubga yuklamang.

## 2. Yangi snapshot va tekshiruv

Zaxira uchun `077` ishlatiladi; yangi public fayllar/build uchun uni **022** ga qaytaring. Aks holda Nginx CSS/rasmlarni o'qishda 403 qaytarishi mumkin.

```bash
umask 022
git pull --ff-only origin main
backend/venv312/bin/python backend/manage.py sync_public_snapshot
```

Bu dry-run: database o'zgarishlari rollback qilinadi, media ko'chirilmaydi. Kutilgan yakun: `DRY RUN: 12 profiles, 45 recognition assignments, 12 news. Accounts and contacts preserved.`

## 3. Qo'llash

```bash
backend/venv312/bin/python backend/manage.py sync_public_snapshot --apply
pm2 restart alumni-backend
pm2 save
```

Kutilgan yakun: `APPLIED: 12 profiles, 45 recognition assignments, 12 news. Accounts and contacts preserved.` Backend restart barcha Gunicorn workerlaridagi lokal cache'larni ham yangilaydi. Ma'lumotlar uchun frontendni qayta build qilish shart emas.

## 4. Tekshirish

```bash
curl -f http://127.0.0.1:8000/api/v1/alumni/?honorary=true
pm2 logs alumni-backend --lines 30 --nostream
```

Domenni Ctrl+F5 bilan yangilang: alumni kartalarida biriktirilgan unvonlar va e'tirof ro'yxatini tekshiring. API JSON faqat bir sahifa bo'lsa, umumiy son `pagination.count` maydonida ko'rsatiladi. Ushbu snapshot importi vaqtida production serverga agent ulanmagan; serverdagi qo'llash operator tomonidan bajariladi.
