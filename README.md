# QarshiDU ALUMNI MVP

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

## Production Sozlamalari

Production muhitida xavfsizlik va barqarorlikni ta'minlash uchun quyidagilarga e'tibor qaratish lozim:

- **Muhit O'zgaruvchilari**: `.env` faylida barcha zarur o'zgaruvchilar bo'lishi kerak. `.env.example` faylidan namuna sifatida foydalanishingiz mumkin.
- **Xavfsizlik Sozlamalari**: `DEBUG=False` bo'lganida `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` kabi HSTS va HTTPS yo'naltirish sozlamalari ishga tushadi. Bu ma'lumotlar xavfsizligini oshiradi.
- **SECRET_KEY**: Production uchun mutlaqo xavfsiz va noyob `DJANGO_SECRET_KEY` o'rnatilishi SHART. Agar u standart "dev-only-change-me" bo'lib qolsa, tizim xatoga yo'l qo'yib ishga tushmaydi (`ImproperlyConfigured` xatosi beriladi).


## Muhim arxitektura qarori

`FeaturedAlumni` alohida model. Bu editorial title, qisqa story, tartib va faollik tarixini profilning user-editable maydonlaridan ajratadi. Uni faqat Django Admin orqali authorized staff boshqaradi; public API faqat active va public profillarni o‘qiydi.

Public alumni serializer email va telefonni umuman e’lon qilmaydi. `verification_status`, role va featured holati alumni update serializerida yozilmaydi. Visibility barcha detail/list querysetlariga server tomonda qo‘llanadi.


## Local account sign-in

Google sign-in uses Google Identity Services and server-side verification of the signed ID token, audience, expiry and session nonce. Configure `GOOGLE_CLIENT_ID` in `backend/.env` using a **Web application** client in Google Cloud. Add both `http://localhost:3000` and `http://127.0.0.1:3000` to **Authorized JavaScript origins** (and the HTTPS origin for production). No client secret is needed for this flow. Restart the backend after changing environment settings. See https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid.

For email codes, configure the `EMAIL_*` and `DEFAULT_FROM_EMAIL` values documented in `backend/.env.example`. A console email backend does not deliver mail; the UI reports the service as unavailable in that configuration. Failed SMTP delivery returns an error instead of success. Do not commit real SMTP passwords.

Run `python manage.py migrate` in `backend` to add the Google account identifier. Sign-in and profile editing use the same-origin `/api/v1/` proxy, Django session cookies and CSRF tokens. `/profile` loads the authenticated user's profile. Registration requires verified email and retains the full name, email, graduation year and consent fields.

Validation: `python -m pytest apps/accounts/tests.py -q` from `backend`; `npm.cmd test -- components/onboarding/onboarding.test.tsx components/alumni/edit-profile-modal.test.tsx __tests__/api.test.ts` and `node node_modules/typescript/bin/tsc --noEmit` from `frontend`.
