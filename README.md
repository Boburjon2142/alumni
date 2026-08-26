# QarDU ALUMNI MVP

Qarshi davlat universiteti bitiruvchilari uchun Next.js + Django REST Framework asosidagi professional MVP.

## Ishga tushirish

Backend (SQLite local fallback bilan):

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Frontend (yangi terminalda):

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend: `http://localhost:3000`, API: `http://127.0.0.1:8000/api/v1/`, admin: `http://127.0.0.1:8000/admin/`.

PostgreSQL ishlatish uchun `.env.example` dagi `POSTGRES_*` qiymatlarini muhitga kiriting. Ular berilmasa local development uchun SQLite ishlatiladi.

## Tekshiruv

```powershell
cd backend
pytest -q
python manage.py check

cd ..\frontend
npm.cmd run build
```

## Muhim arxitektura qarori

`FeaturedAlumni` alohida model. Bu editorial title, qisqa story, tartib va faollik tarixini profilning user-editable maydonlaridan ajratadi. Uni faqat Django Admin orqali authorized staff boshqaradi; public API faqat active va public profillarni o‘qiydi.

Public alumni serializer email va telefonni umuman e’lon qilmaydi. `verification_status`, role va featured holati alumni update serializerida yozilmaydi. Visibility barcha detail/list querysetlariga server tomonda qo‘llanadi.

