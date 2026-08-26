import os
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.alumni.models import AlumniProfile, FeaturedAlumni
from apps.editorial.models import AlumniAdvice, AlumniInterview, Event, InterviewItem, StorySection, SuccessStory
from apps.universities.models import Faculty, Specialty


def unsplash(photo_id, width=1200, height=900):
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&h={height}&q=80"


def source(photo_id):
    # The image CDN identifier is not an Unsplash public-page slug. Keep the
    # attribution honest without inventing a photographer or a page URL.
    return "https://unsplash.com"


ALUMNI = [
    ("azizbek-rahmonov", "Azizbek Rahmonov", "Axborot texnologiyalari", "Dasturiy injiniring", 2015, "Senior dasturiy ta’minot muhandisi", "Rivoj Digital Studio", "Technology", "Toshkent", True, "1500648767791-00dcc994a43e", "Murakkab tizimlarni sodda va barqaror yechimlarga aylantirishga ixtisoslashgan texnik mutaxassis.", "A technical professional focused on turning complex systems into clear, reliable products."),
    ("dilnoza-karimova", "Dilnoza Karimova", "Iqtisodiyot", "Moliya va iqtisodiy tahlil", 2018, "Moliyaviy tahlil rahbari", "Barqaror Moliya Guruhi", "Finance", "Toshkent", True, "1494790108377-be9c29b29330", "Ma’lumotlarga asoslangan qarorlar va yosh tahlilchilarni rivojlantirish bilan shug‘ullanadi.", "She works on evidence-led financial decisions and the development of early-career analysts."),
    ("javohir-ergashev", "Javohir Ergashev", "Matematika", "Amaliy matematika", 2011, "Ma’lumotlar tahlili bo‘yicha ekspert", "Aniq Tahlil Markazi", "Technology", "Samarqand", False, "1560250097-0b93528c311a", "Amaliy matematika yondashuvlarini biznes va jamoat loyihalaridagi tahliliy vazifalarga qo‘llaydi.", "He applies mathematical thinking to analytical challenges in business and public-interest projects."),
    ("madina-normurodova", "Madina Normurodova", "Filologiya", "O‘zbek tili va adabiyoti", 2007, "Tahririyat yo‘nalishi rahbari", "Mazmun Media Loyihasi", "Media", "Qarshi", True, "1573496359142-b8d87734a5a2", "Ta’limiy va ijtimoiy mavzularni aniq, mas’uliyatli media mahsulotlariga aylantiradi.", "She turns educational and social themes into clear, responsible media products."),
    ("sardor-usmonov", "Sardor Usmonov", "Tarix", "Davlat boshqaruvi tarixi", 2003, "Dasturlar koordinatori", "Hududiy Taraqqiyot Markazi", "Public Administration", "Qarshi", False, "1507003211169-0a1dd7228f2d", "Hududiy loyihalarda tadqiqot, rejalashtirish va manfaatdor tomonlar hamkorligini muvofiqlashtiradi.", "He coordinates research, planning and stakeholder collaboration in regional programmes."),
    ("nargiza-tursunova", "Nargiza Tursunova", "Pedagogika", "Ta’lim metodikasi", 1998, "Akademik dasturlar maslahatchisi", "Yangi Avlod Ta’lim Markazi", "Education", "Qarshi", True, "1534528741775-53994a69daeb", "O‘qituvchilar uchun amaliy metodika va ta’lim dasturlarini takomillashtirish ustida ishlaydi.", "She supports practical teaching methods and the improvement of learning programmes."),
    ("bekzod-murodov", "Bekzod Murodov", "Kimyo-biologiya", "Biologiya", 2020, "Tadqiqot loyihalari mutaxassisi", "Ilmiy Amaliyot Laboratoriyasi", "Science", "Toshkent", False, "1517841905240-472988babdf9", "Laboratoriya tartibi, ilmiy hujjatlashtirish va yosh tadqiqotchilar bilan ishlashga e’tibor qaratadi.", "His work centres on laboratory practice, research documentation and early-career researchers."),
    ("shahnoza-odilova", "Shahnoza Odilova", "Iqtisodiyot", "Biznes boshqaruvi", 2022, "Loyiha koordinatori", "O‘sish Biznes Studiyasi", "Business", "Qarshi", False, "1508214751196-bcfd4ca60f91", "Kichik bizneslar uchun mijoz tadqiqoti va jarayonlarni tizimlashtirish loyihalarini boshqaradi.", "She coordinates customer research and operational improvement projects for small businesses."),
    ("ulugbek-sobirov", "Ulug‘bek Sobirov", "Axborot texnologiyalari", "Axborot tizimlari", 2018, "Muhandislik jamoasi yetakchisi", "Yechimlar Muhandislik Markazi", "Engineering", "Toshkent", False, "1557862921-37829c790f19", "Mahsulot jamoalarida texnik sifat, hamkorlik va muhandislik jarayonlarini rivojlantiradi.", "He develops engineering quality, collaboration and delivery practices across product teams."),
    ("mohira-saidova", "Mohira Saidova", "Pedagogika", "Psixologiya va pedagogika", 2015, "Ta’lim dasturlari menejeri", "Kelajak Ko‘nikmalari Markazi", "Education", "Buxoro", False, "1531123897727-8f129e1688ce", "Talabalar uchun kasbiy yo‘naltirish va zamonaviy ko‘nikmalar dasturlarini ishlab chiqadi.", "She designs career guidance and modern-skills programmes for students."),
]

STORIES = [
    ("azizbek-rahmonov", "texnik-masuliyatdan-jamoa-yetakchiligigacha", "Texnik mas’uliyatdan jamoa yetakchiligigacha", "From technical ownership to team leadership", "Kichik loyiha uchun mas’uliyat olish qanday qilib tizimli fikrlash va jamoa yetakchiligiga yo‘l ochgani haqida.", "How ownership of a small project became a path toward systems thinking and team leadership.", "1497366754035-f200968a6e72", True,
     ["Universitet yillarida Azizbek algoritm va dasturlashni faqat fan sifatida emas, muammoni bosqichma-bosqich yechish usuli sifatida o‘rgandi.", "Bitiruvdan keyin u kichik texnik jamoada qo‘llab-quvvatlash va ichki vositalar yaratish bilan ish boshladi.", "Ikkinchi yilida kechikayotgan loyihaning texnik rejasini qayta tuzish vazifasini olishi uning burilish nuqtasi bo‘ldi.", "U vazifalarni kichik relizlarga ajratib, jamoa ichidagi kod ko‘rib chiqish jarayonini yo‘lga qo‘ydi.", "Bugun u muhandislik qarorlarida tezlik bilan birga barqarorlik va tushunarli kommunikatsiyani ustuvor deb biladi.", "Talabalarga tavsiyasi: kichik loyiha bo‘lsa ham, natija uchun to‘liq mas’uliyat olishni mashq qiling."],
     ["At university, Azizbek learned to see algorithms not only as a subject but as a disciplined way to solve problems.", "After graduation, he started in a small technical team, supporting systems and building internal tools.", "His turning point came in his second year when he was asked to rebuild the plan for a delayed project.", "He split the work into smaller releases and introduced a consistent peer-review routine.", "Today he values reliability and clear communication as highly as delivery speed.", "His advice to students is to practise full ownership, even when the project itself is small."]),
    ("dilnoza-karimova", "raqamlardan-qarorlargacha", "Raqamlardan asoslangan qarorlargacha", "From numbers to better decisions", "Moliyaviy hisobotdan tashqariga chiqib, tahlilni rahbariyat uchun amaliy qarorga aylantirish tajribasi.", "A journey from preparing reports to turning analysis into practical decisions for leaders.", "1556761175-b413da4baf72", True,
     ["Dilnoza universitetda moliya bilan birga statistika va taqdimot ko‘nikmalariga alohida e’tibor berdi.", "Faoliyatining dastlabki bosqichida u muntazam hisobotlar tayyorlar, ammo natijalarning qarorlarga ta’siri cheklanganini sezardi.", "Bir budjet loyihasida xarajatlar sababini bo‘limlar kesimida tushuntirib berishi unga yangi mas’uliyat olib keldi.", "Shundan so‘ng u hisobotlarni savol, dalil va tavsiya shaklida qurishni odat qildi.", "Hozir u yosh tahlilchilarga aniqlik, manba sifati va xulosaning amaliy qiymatini birgalikda baholashni o‘rgatadi.", "Talabalarga tavsiyasi: jadval tuzish bilan cheklanmay, raqam nimani o‘zgartirishi kerakligini ham ayting."],
     ["Dilnoza gave equal attention to finance, statistics and presentation skills at university.", "Early in her career she prepared regular reports but saw that they had limited influence on decisions.", "A budget assignment changed that when she clearly explained the drivers behind costs across departments.", "She then began structuring every analysis around a question, evidence and a practical recommendation.", "Today she teaches junior analysts to evaluate clarity, source quality and decision value together.", "Her advice is not to stop at the spreadsheet: explain what the numbers should change."]),
    ("madina-normurodova", "aniq-matndan-ishonchli-mediagacha", "Aniq matndan ishonchli mediagacha", "From clear writing to trusted media", "Tahririyat intizomi va auditoriyani tinglash professional media yo‘nalishini qanday shakllantirgani haqida.", "How editorial discipline and listening to audiences shaped a professional media path.", "1522202176988-66273c2fd55f", True,
     ["Madina filologiya ta’limida matnning ohangi, dalili va o‘quvchiga ta’sirini bir butun ko‘rishni o‘rgandi.", "U dastlab ta’limiy materiallarni tahrirlash va qisqa axborot matnlarini tayyorlash bilan shug‘ullandi.", "Auditoriya savollari asosida bir ruknni qayta qurishi uning ish uslubidagi muhim burilish bo‘ldi.", "Jamoa mavzularni avval foydalanuvchi ehtiyoji bilan tekshirib, so‘ng format va kanalni tanlay boshladi.", "Bugun Madina tahririyat sifatini tezkorlikdan ustun qo‘ymaydi, aksincha ikkalasini aniq jarayon bilan uyg‘unlashtiradi.", "Uning tavsiyasi: yaxshi matn avval tinglashdan, keyin yozishdan boshlanadi."],
     ["Madina learned to consider tone, evidence and reader impact as one editorial responsibility.", "She began by editing educational materials and producing concise information pieces.", "Her turning point came when audience questions led her to redesign an entire content series.", "The team started validating topics against user needs before choosing format and channel.", "Today she balances editorial quality and speed through a clear, repeatable process.", "Her advice is simple: strong writing begins with listening before drafting."]),
    ("nargiza-tursunova", "tajribani-metodikaga-aylantirish", "Tajribani amaliy metodikaga aylantirish", "Turning experience into practical teaching", "Sinfdagi kuzatuvlar qanday qilib o‘qituvchilar uchun sodda va foydali metodikaga aylangani haqida.", "How classroom observations became simple, useful methods for practising teachers.", "1509062522246-3755977927d7", False,
     ["Nargiza talabalik davridayoq nazariya bilan amaliy kuzatuv o‘rtasidagi farqni qayd etib borardi.", "Faoliyatini o‘qituvchilikdan boshlab, har bir mashg‘ulotdan keyin qisqa refleksiya yozishni odat qildi.", "Bir guruh o‘qituvchilar bilan dars tahlili o‘tkazishi bu qaydlarni tizimli metodikaga aylantirishga turtki berdi.", "U murakkab tavsiyalar o‘rniga sinab ko‘rish mumkin bo‘lgan kichik pedagogik qadamlarni taklif qildi.", "Hozir u dasturlarni o‘qituvchining kundalik sharoitiga mosligi bilan baholaydi.", "Talabalarga tavsiyasi: nazariyani eslab qolishdan oldin uni qayerda sinashingizni aniqlang."],
     ["Nargiza noticed the gap between theory and observation while she was still a student.", "She began as a teacher and developed a habit of writing a short reflection after each lesson.", "A collaborative lesson review prompted her to turn those notes into a repeatable method.", "Instead of abstract guidance, she proposed small teaching practices that colleagues could test immediately.", "Today she judges programmes by how well they fit the realities of a teacher’s working day.", "Her advice is to decide where you will test a theory before trying to memorise it."]),
]

INTERVIEWS = [
    ("javohir-ergashev", "javohir-ergashev-bilan-suhbat", "Tahliliy fikrlash — kasbiy til", "Analytical thinking as a professional language", "Amaliy matematika, murakkab savollar va tushunarli xulosalar haqida suhbat.", "A conversation about applied mathematics, difficult questions and clear conclusions.", "Aniq savol yaxshi tahlilning yarmidir.", "A precise question is half of a good analysis."),
    ("sardor-usmonov", "sardor-usmonov-bilan-suhbat", "Jamoat loyihalarida tinglashning o‘rni", "Why listening matters in public programmes", "Hududiy loyihalarda reja, muloqot va javobgarlik haqida suhbat.", "A conversation about planning, dialogue and accountability in regional programmes.", "Yechim hujjatda emas, odamlar bilan suhbatda aniqlashadi.", "Solutions become clearer in conversation, not only in documents."),
    ("mohira-saidova", "mohira-saidova-bilan-suhbat", "Talabadan kasbiy yo‘lga o‘tish", "Moving from student life into a career", "Ko‘nikmalar, tajriba va birinchi professional qadamlar haqida suhbat.", "A conversation about skills, experience and the first professional steps.", "Ishga tayyorlik diplomdan oldin, odatlardan boshlanadi.", "Career readiness begins with habits before it begins with a diploma."),
]

QUESTIONS = [
    ("QarDUdagi ta’lim sizga nimalar berdi?", "What did your education at KarSU give you?"),
    ("Professional yo‘lingizdagi eng muhim qaror qaysi bo‘lgan?", "What was the most important decision in your professional journey?"),
    ("Eng katta qiyinchilik nima edi?", "What was the greatest challenge?"),
    ("Talabalar qaysi ko‘nikmaga ko‘proq e’tibor berishi kerak?", "Which skill deserves more attention from students?"),
    ("Bugungi talabalarga qanday maslahat berasiz?", "What advice would you give students today?"),
]

ANSWERS_UZ = [
    ["Menga masalani modelga aylantirish va taxminni dalildan ajratishni berdi. Bu odat har qanday sohadagi tahlilda foydali.", "Faqat hisoblash emas, natijani oddiy tilda tushuntirishni o‘rganishga qaror qilganim muhim bo‘lgan.", "Noaniq topshiriqlarda to‘g‘ri savolni topish eng katta qiyinchilik edi. Vaqt o‘tishi bilan savolni aniqlash ishning asosiy qismi ekanini bildim.", "Mantiqiy fikrlash bilan birga yozma kommunikatsiyaga. Yaxshi xulosa tushunarli bo‘lmasa, uning qiymati kamayadi.", "Kichik ma’lumotlar to‘plamida ham sifatli savol va toza metod bilan ishlang. Ko‘lam keyin keladi."],
    ["Tarixiy jarayonlarni sabab va manfaatlar bilan ko‘rishni o‘rgandim. Bu jamoat loyihalarida shoshilinch xulosadan saqlaydi.", "Rejani kabinetda yakunlamasdan, avval manfaatdor tomonlar bilan tekshirishga o‘tganim eng muhim qaror edi.", "Turli guruhlarning kutishlarini bitta aniq maqsad atrofida birlashtirish qiyin bo‘lgan. Bunda muntazam muloqot yordam berdi.", "Tinglash va qisqa, aniq qayd yuritishga. Eshitilgan fikr hujjatga va keyingi harakatga aylanishi kerak.", "Odamlar bilan ishlashni alohida ko‘nikma deb biling. Hurmatli muloqot ko‘p texnik xatolarning oldini oladi."],
    ["Ta’lim menga o‘rganish jarayonini kuzatish va odamning ehtiyojini tushunishni berdi. Bu dastur tuzishda juda muhim.", "Bir vaqtning o‘zida ko‘p yo‘nalish ortidan ketmasdan, bitta ko‘nikmani amaliy loyiha bilan chuqurlashtirishga qaror qildim.", "Tajriba yetishmasligini yashirish istagi qiyin bo‘lgan. Savol berish va fikr-mulohaza so‘rash tezroq o‘sishga yordam berdi.", "O‘zini boshqarish va taqdimot ko‘nikmasiga. Bilimni muddat, natija va auditoriya bilan bog‘lash kerak.", "Har semestr yakunida bitta ko‘rinadigan natija yarating: loyiha, tadqiqot yoki yaxshi hujjatlashtirilgan amaliyot."],
]

ADVICE = [
    ("azizbek-rahmonov", "career", "Mas’uliyatni kichik loyihadan boshlang", "Start ownership with a small project", "Kichik vazifa bo‘lsa ham, maqsad, muddat va natijani o‘zingiz kuzating. Mas’uliyat odati keyingi katta imkoniyatlarga tayyorlaydi.", "Even on a small assignment, track the goal, deadline and outcome yourself. The habit of ownership prepares you for larger opportunities."),
    ("dilnoza-karimova", "study", "Raqam ortidagi savolni toping", "Find the question behind the number", "Formulani bilish yetarli emas. Har bir hisob nimani tushuntirishi va qaysi qarorga yordam berishini yozib ko‘ring.", "Knowing the formula is not enough. Write down what each calculation explains and which decision it should support."),
    ("javohir-ergashev", "personal_growth", "Xulosani sodda ayting", "Make the conclusion simple", "Murakkab tahlilning qiymati uning tushunarli xulosasida. Natijani soha mutaxassisi bo‘lmagan odamga ham izohlashni mashq qiling.", "The value of complex analysis lies in a clear conclusion. Practise explaining the result to someone outside your field."),
    ("madina-normurodova", "career", "Avval tinglang, keyin yozing", "Listen before you write", "Yaxshi matn faqat uslubdan iborat emas. Auditoriya savolini tinglang, manbani tekshiring va keyin eng kerakli fikrni yozing.", "Good writing is more than style. Listen to the audience’s question, verify the source and then write what matters most."),
    ("sardor-usmonov", "leadership", "Kelishuvni qayd eting", "Document the agreement", "Uchrashuvdan keyin mas’ul shaxs, muddat va keyingi qadamni qisqa yozib yuboring. Bu ishonch va hamkorlikni mustahkamlaydi.", "After a meeting, record the owner, deadline and next step. This simple habit strengthens trust and collaboration."),
    ("nargiza-tursunova", "study", "Nazariyani kichik tajribada sinang", "Test theory through a small experiment", "Yangi metodni birdan mukammal qilishga urinmang. Uni bitta mashg‘ulotda sinab, kuzatuv yozing va keyingi safar yaxshilang.", "Do not try to perfect a new method immediately. Test it in one session, note what happened and improve it next time."),
    ("ulugbek-sobirov", "leadership", "Fikr-mulohazani jarayonga aylantiring", "Turn feedback into a routine", "Fikr-mulohazani faqat xato paytida emas, muntazam so‘rang. Aniq savol va kichik o‘zgarish jamoaning o‘sishini tezlashtiradi.", "Ask for feedback regularly, not only after mistakes. A precise question and a small adjustment help teams improve faster."),
    ("mohira-saidova", "personal_growth", "Har semestrda bitta ko‘rinadigan natija", "Create one visible result each semester", "Har semestr loyiha, tadqiqot yoki amaliy hisobot kabi ko‘rsatish mumkin bo‘lgan bitta sifatli natija yarating.", "Each semester, create one strong piece of visible work: a project, research note or well-documented practical report."),
]

EVENTS = [
    ("qardu-bitiruvchilar-uchrashuvi-2026", "meetup", "QarDU bitiruvchilar uchrashuvi 2026", "KarSU Alumni Meetup 2026", "Turli avlod bitiruvchilari va talabalar uchun tajriba almashish uchrashuvi.", "An exchange of experience for alumni across generations and current students.", 24, 3, "Qarshi davlat universiteti bosh binosi", "KarSU main building", "1540575467063-178a50c2df87", True),
    ("universitet-taraqqiyotida-bitiruvchilar-roli", "conference", "Universitet taraqqiyotida bitiruvchilar roli", "The role of alumni in university development", "Ta’lim sifati va universitet hamkorliklari bo‘yicha ochiq konferensiya.", "An open conference on education quality and university partnerships.", 51, 4, "Universitet konferensiya zali", "University conference hall", "1505373877841-8d25f7d46678", True),
    ("yosh-mutaxassislar-uchun-ochiq-suhbat", "career_talk", "Yosh mutaxassislar uchun ochiq suhbat", "An open career talk for young professionals", "Bitiruvdan keyingi dastlabki qadamlar, portfolio va professional muloqot haqida.", "A practical conversation about first career steps, portfolios and professional communication.", 79, 2, "Online", "Online", "1524178232363-1fb2b075b655", True),
    ("qardu-yubiley-uchrashuvi", "anniversary", "QarDU yubiley uchrashuvi", "KarSU anniversary gathering", "Universitet tarixi va bitiruvchilar xotiralari atrofidagi ochiq uchrashuv.", "An open gathering around university history and alumni memories.", -35, 4, "Qarshi shahri", "Karshi city", "1523580846011-d3a5bc25702b", False),
    ("talimda-amaliy-tajriba", "guest_lecture", "Ta’limda amaliy tajriba", "Practical experience in education", "O‘qituvchilar va bitiruvchilar ishtirokidagi ochiq ma’ruza.", "A public lecture featuring educators and alumni practitioners.", -67, 2, "Universitet konferensiya zali", "University conference hall", "1509062522246-3755977927d7", False),
    ("bitiruvchilar-va-talabalar-tajriba-almashinuvi", "reunion", "Bitiruvchilar va talabalar: tajriba almashinuvi", "Alumni and students: an exchange of experience", "Kasbiy yo‘llar va universitetdagi imkoniyatlar haqida avlodlararo suhbat.", "An intergenerational conversation about career paths and opportunities at university.", -112, 3, "Qarshi davlat universiteti bosh binosi", "KarSU main building", "1531482615713-2afd69097998", False),
]


class Command(BaseCommand):
    help = "Professional, realistic-but-fictional demo dataset yaratadi."

    def add_arguments(self, parser):
        parser.add_argument("--confirm", action="store_true", help="Demo ma’lumot yaratishni tasdiqlaydi.")

    @transaction.atomic
    def handle(self, *args, **options):
        if not options["confirm"]:
            raise CommandError("Demo seed uchun --confirm flagini kiriting.")
        if not settings.DEBUG and os.getenv("ALLOW_DEMO_SEED", "").lower() != "true":
            raise CommandError("Production muhitida faqat ALLOW_DEMO_SEED=true bilan ruxsat etiladi.")

        people = {}
        for order, row in enumerate(ALUMNI, start=1):
            slug, name, faculty_name, specialty_name, year, position, organization, industry, city, featured, photo_id, bio_uz, bio_en = row
            faculty, _ = Faculty.objects.get_or_create(name=faculty_name)
            specialty, _ = Specialty.objects.get_or_create(faculty=faculty, name=specialty_name)
            person, _ = AlumniProfile.objects.update_or_create(slug=slug, defaults={
                "full_name": name, "faculty": faculty, "specialty": specialty, "graduation_year": year,
                "degree": "Bakalavr", "position": position, "current_company": organization,
                "industry": industry, "city": city, "country": "O‘zbekiston", "bio": bio_uz,
                "biography_uz": bio_uz, "biography_en": bio_en, "is_featured": featured,
                "featured_order": order if featured else None, "is_published": True,
                "verification_status": AlumniProfile.Verification.VERIFIED,
                "image_url": unsplash(photo_id, 800, 1000), "image_alt": f"{name} professional portreti",
                "image_credit": "Unsplash", "image_source_url": source(photo_id),
            })
            people[slug] = person
            if featured:
                FeaturedAlumni.objects.update_or_create(alumni=person, defaults={
                    "title": position, "short_description": bio_uz, "display_order": order, "is_active": True,
                })

        for row in STORIES:
            alumnus_slug, slug, title_uz, title_en, summary_uz, summary_en, photo_id, featured, uz_paragraphs, en_paragraphs = row
            story, _ = SuccessStory.objects.update_or_create(slug=slug, defaults={
                "alumnus": people[alumnus_slug], "title_uz": title_uz, "title_en": title_en,
                "summary_uz": summary_uz, "summary_en": summary_en, "is_featured": featured, "is_published": True,
                "hero_image_url": unsplash(photo_id, 1400, 788), "hero_image_alt": f"{title_uz} hikoyasi uchun professional ish muhiti",
                "hero_image_credit": "Unsplash", "hero_image_source_url": source(photo_id),
                "student_takeaway_uz": uz_paragraphs[-1], "student_takeaway_en": en_paragraphs[-1],
            })
            for index, (uz, en) in enumerate(zip(uz_paragraphs[:-1], en_paragraphs[:-1]), start=1):
                kind = ("university", "early_career", "turning_point", "achievements", "current_impact")[index - 1]
                StorySection.objects.update_or_create(story=story, order=index, defaults={
                    "kind": kind, "heading_uz": "", "heading_en": "", "content_uz": uz, "content_en": en,
                })

        for interview_index, row in enumerate(INTERVIEWS):
            alumnus_slug, slug, title_uz, title_en, intro_uz, intro_en, quote_uz, quote_en = row
            interview, _ = AlumniInterview.objects.update_or_create(slug=slug, defaults={
                "alumnus": people[alumnus_slug], "title_uz": title_uz, "title_en": title_en,
                "intro_uz": intro_uz, "intro_en": intro_en, "pull_quote_uz": quote_uz,
                "pull_quote_en": quote_en, "is_featured": interview_index < 2, "is_published": True,
            })
            for order, ((question_uz, question_en), answer_uz) in enumerate(zip(QUESTIONS, ANSWERS_UZ[interview_index]), start=1):
                InterviewItem.objects.update_or_create(interview=interview, order=order, defaults={
                    "question_uz": question_uz, "question_en": question_en, "answer_uz": answer_uz,
                    "answer_en": self._english_answer(interview_index, order),
                })

        for index, (alumnus_slug, category, title_uz, title_en, content_uz, content_en) in enumerate(ADVICE, start=1):
            AlumniAdvice.objects.update_or_create(
                alumnus=people[alumnus_slug], title_uz=title_uz,
                defaults={"category": category, "title_en": title_en, "content_uz": content_uz,
                          "content_en": content_en, "source_type": "manual", "is_featured": index <= 4,
                          "is_published": True},
            )

        now = timezone.now()
        for slug, event_type, title_uz, title_en, summary_uz, summary_en, day_offset, duration, location_uz, location_en, photo_id, featured in EVENTS:
            start_at = now + timedelta(days=day_offset)
            Event.objects.update_or_create(slug=slug, defaults={
                "title_uz": title_uz, "title_en": title_en, "summary_uz": summary_uz, "summary_en": summary_en,
                "description_uz": summary_uz + " Dastur savol-javob va amaliy tajriba almashish qismlarini o‘z ichiga oladi.",
                "description_en": summary_en + " The programme includes a moderated Q&A and practical exchange of experience.",
                "event_type": event_type, "start_at": start_at, "end_at": start_at + timedelta(hours=duration),
                "location_type": "online" if location_uz == "Online" else "offline",
                "location_uz": location_uz, "location_en": location_en, "is_featured": featured, "is_published": True,
                "cover_image_url": unsplash(photo_id, 1400, 788), "cover_image_alt": f"{title_uz} tadbiri ishtirokchilari",
                "cover_image_credit": "Unsplash", "cover_image_source_url": source(photo_id),
            })

        self.stdout.write(self.style.SUCCESS(
            f"Demo seed tayyor: {len(ALUMNI)} alumni, {len(STORIES)} hikoya, {len(INTERVIEWS)} intervyu, {len(ADVICE)} maslahat, {len(EVENTS)} tadbir."
        ))

    @staticmethod
    def _english_answer(interview_index, order):
        answers = [
            ["It taught me to turn a problem into a model and separate assumptions from evidence. That discipline is useful in any analytical field.", "Choosing to explain results in plain language, not only calculate them, changed my career direction.", "The hardest part was finding the right question in an ambiguous brief. I learned that defining the question is a substantial part of the work.", "Students should pair logical thinking with written communication. A strong result loses value when it cannot be understood.", "Work carefully with small datasets and clear methods. Scale can come later."],
            ["It taught me to examine processes through causes, interests and context. That prevents rushed conclusions in public programmes.", "My most important decision was to test plans with stakeholders before finalising them at a desk.", "Bringing different expectations around one practical goal was difficult. Regular, respectful communication made it possible.", "Students should practise listening and concise documentation. What is heard must become a record and a next step.", "Treat working with people as a professional skill in its own right. Respectful dialogue prevents many technical mistakes."],
            ["My education helped me observe how people learn and understand their needs. That perspective is essential when designing programmes.", "I stopped chasing many directions at once and chose to deepen one skill through a real project.", "The temptation to hide inexperience was difficult. Asking questions and requesting feedback helped me progress faster.", "Self-management and presentation deserve more attention. Knowledge needs to connect with deadlines, outcomes and audiences.", "Finish each semester with one visible result: a project, a research note or a well-documented practical experience."],
        ]
        return answers[interview_index][order - 1]
