import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile
from apps.editorial.models import AlumniInterview, InterviewItem

INTERVIEW_DATA = [
    {
        "alumnus_slug": "allayev-dolli-hakimovich",
        "slug": "allayev-dolli-hakimovich-bilan-suhbat",
        "title_uz": "Ilm-fan va energetikada yuksak natijalarga erishish omillari",
        "title_en": "Key factors for achieving excellence in science and energy",
        "intro_uz": "Oliy taʼlim tizimida uzoq yillik pedagogik va ilmiy-tadqiqot faoliyati bilan shug‘ullangan professor Dilshod Allayev bilan QarshiDUdagi talabalik yillari, ilm-fanga kirib kelish va yosh olimlar oldidagi dolzarb vazifalar haqida suhbatlashdik.",
        "intro_en": "A deep conversation with Professor Dilshod Allayev about his student days at KarSU, his journey into high science, and practical guidance for young researchers.",
        "pull_quote_uz": "Ilmga intilish va to‘xtovsiz mehnat har doim eng buyuk yutuqlarning mustahkam poydevoridir.",
        "pull_quote_en": "Devotion to knowledge and continuous effort are the solid foundation of all great achievements.",
        "is_featured": True,
        "items": [
            {
                "question_uz": "QarshiDUdagi talabalik yillaringiz sizda qanday taassurot qoldirgan va fanga qiziqishingiz qanday shakllangan?",
                "question_en": "What impressions did your student years at KarSU leave, and how did your interest in science develop?",
                "answer_uz": "Universitetdagi har bir ma’ruza va laboratoriya mashg‘uloti biz uchun yangi kashfiyot edi. Ustozlarimiz nafaqat fanni o‘rgatar, balki muammolarni mustaqil tahlil qilish, mantiqiy xulosa chiqarish ko‘nikmasini singdirardi. Ana shu talabchanlik va ilmiy muhit fanga butun umrlik mehrimni uyg‘otgan.",
                "answer_en": "Every lecture and lab session at the university was a new discovery for us. Our mentors taught us not just the subject, but how to analyze problems independently and draw logical conclusions.",
                "order": 1
            },
            {
                "question_uz": "Ilmiy faoliyatingizda eng muhim burilish nuqtasi qaysi davrga to‘g‘ri kelgan?",
                "question_en": "What was the most defining turning point in your scientific career?",
                "answer_uz": "Nomzodlik dissertatsiyasi ustida ishlayotgan paytda energetika tizimlarida intellektual boshqaruv modelini ishlab chiqish jarayoni eng muhim bosqich bo‘ldi. Nazariy hisoblarni real sanoat tajribalarida sinab ko‘rib, kutilgan samara olingach, ilmning amaliy kuchiga qat’iy ishondim.",
                "answer_en": "The most pivotal period was developing intelligent control models for energy systems during my doctoral research. Validating theoretical models in practical industrial trials proved the real power of science.",
                "order": 2
            },
            {
                "question_uz": "Bugungi yosh talabalar va bo‘lajak mutaxassislarga qanday amaliy tavsiyalarni berasiz?",
                "question_en": "What practical recommendations would you give to current students and future specialists?",
                "answer_uz": "Avvalo, o‘z sohangizning fundamental asoslarini puxta o‘rganing. Zamonaviy xorijiy tillarni va axborot texnologiyalarini o‘zlashtiring. Nazariyani laboratoriya va amaliyot bilan doimiy bog‘lab boring. Vaqtni to‘g‘ri taqsimlash va intizom har qanday iqtidordan ustundir.",
                "answer_en": "Master the fundamental foundations of your field thoroughly. Learn foreign languages and modern technologies. Connect theory with laboratory practice constantly.",
                "order": 3
            },
            {
                "question_uz": "Sizningcha, haqiqiy ustozlik burchi nimalardan iborat?",
                "question_en": "In your view, what defines a true mentorship duty?",
                "answer_uz": "Haqiqiy ustoz shogirdiga faqat tayyor bilimlarni beribgina qolmay, unda mustaqil izlanish va ijodiy fikrlash ishtiyoqini uyg‘ota olishi kerak. Shogirdining yutug‘idan chin dildan quvonish va unga yangi marralarni zabt etishida qanot bo‘lish — ustozlikning oliy burchidir.",
                "answer_en": "A true mentor does not merely pass on ready facts, but sparks independent curiosity and creative thinking in students.",
                "order": 4
            }
        ]
    },
    {
        "alumnus_slug": "nematov-sherzod-qalandarovich",
        "slug": "nematov-sherzod-qalandarovich-bilan-suhbat",
        "title_uz": "Zamonaviy muhandislik ta’limi va rahbarlik mas’uliyati",
        "title_en": "Modern engineering education and leadership responsibility",
        "intro_uz": "Qarshi davlat texnika universiteti rektori, professor Sherzod Nematov bilan oliy ta’lim transformatsiyasi, ilm-fan va ishlab chiqarish integratsiyasi hamda muvaffaqiyatli rahbarlik tamoyillari haqida suhbatlashdik.",
        "intro_en": "An interview with University Rector, Professor Sherzod Nematov, on higher education transformation, science-industry integration, and effective leadership principles.",
        "pull_quote_uz": "Zamonaviy rahbar faqat buyruq beruvchi emas, balki jamoasini umumiy ezgu maqsad sari ilhomlantiruvchi yetakchi bo‘lishi lozim.",
        "pull_quote_en": "A modern leader is not just a director, but an inspiring force guiding their team towards a shared mission.",
        "is_featured": True,
        "items": [
            {
                "question_uz": "QarshiDU fizika-texnika fakultetida o‘qigan davringizdagi eng qadrli xotiralaringiz qaysilar?",
                "question_en": "What are your most cherished memories from your studies at KarSU's Faculty of Physics and Technology?",
                "answer_uz": "Universitetdagi do‘stona va ilmiy muhit, kechgacha laboratoriyalarda o‘tkazilgan tajribalar va ustozlarimiz bilan olib borilgan qizg‘in bahslar eng esda qolarli davrlar bo‘lgan. O‘sha paytda shakllangan muhandislik tahlili hozir ham har bir boshqaruv qarorimda asqotadi.",
                "answer_en": "The collaborative scientific atmosphere, late-night laboratory experiments, and passionate discussions with our professors were unforgettable.",
                "order": 1
            },
            {
                "question_uz": "Ilmiy izlanishlardan oliy ta’lim muassasasi rahbarligigacha bo‘lgan yo‘lingiz qanday kechdi?",
                "question_en": "How was your transition from academic research to leading a higher education institution?",
                "answer_uz": "Har bir bosqich o‘ziga xos mas’uliyat talab qildi. Kafedra mudirligi, prorektorlik va nihoyat rektorlik vazifalarida doimo talabalar manfaatini, professor-o‘qituvchilar uchun qulay shart-sharoit yaratishni birlamchi o‘ringa qo‘ydim.",
                "answer_en": "Each step demanded greater accountability. Across department headship and rector positions, prioritizing students' benefits and faculty conditions has remained my guiding principle.",
                "order": 2
            },
            {
                "question_uz": "Bugungi kunda universitetlar oldida turgan eng ustuvor vazifa nima deb hisoblaysiz?",
                "question_en": "What do you consider the highest priority facing universities today?",
                "answer_uz": "Ta’limni real iqtisodiyot va sanoat talablari bilan to‘liq uyg‘unlashtirish. Bitiruvchilarimiz diplom olgan kuni mehnat bozorida eng talabgir, zamonaviy ko‘nikmalarga ega professional sifatida ish boshlashlari kerak.",
                "answer_en": "Harmonizing education with real market and industry demands so graduates are workforce-ready from day one.",
                "order": 3
            }
        ]
    },
    {
        "alumnus_slug": "panjiyev-maqsud-aliqulovich",
        "slug": "panjiyev-maqsud-aliqulovich-bilan-suhbat",
        "title_uz": "Maktab ta’limi sifati va pedagogika kelajagi",
        "title_en": "School education quality and the future of pedagogy",
        "intro_uz": "Maktabgacha va maktab taʼlimi boshqarmasi mas’uli Maqsud Panjiyev bilan zamonaviy maktab o‘qituvchisiga qo‘yilayotgan talablar va pedagogik mahorat sirlari haqida suhbatlashdik.",
        "intro_en": "A conversation with educational administrator Maqsud Panjiyev on the demands facing modern school educators and secrets of pedagogical mastery.",
        "pull_quote_uz": "Yaxshi o‘qituvchi — darsni shunchaki tushuntirib beruvchi emas, balki bolaning qalbida fanga muhabbat uyg‘otuvchi shaxsdir.",
        "pull_quote_en": "A great teacher does not merely explain a lesson; they kindle a lifelong love for learning in a child's heart.",
        "is_featured": True,
        "items": [
            {
                "question_uz": "Matematika fakultetini tamomlab, ta’lim boshqaruvi sohasiga kirib kelishingizga nima turtki bo‘lgan?",
                "question_en": "What motivated you to enter educational administration after graduating in mathematics?",
                "answer_uz": "Matematika fikrlashni tartibga soladi va tizimli qaror qabul qilishga o‘rgatadi. Maktablarda dars berish jarayonida o‘qituvchilarning kasbiy metodikasini takomillashtirish zaruratini ko‘rdim va bu meni ta’lim boshqaruvi yo‘nalishida izlanishga undadi.",
                "answer_en": "Mathematics disciplines thinking and teaches structured decision making. Observing the real classroom drove my desire to enhance pedagogical management.",
                "order": 1
            },
            {
                "question_uz": "Yosh pedagoglarga dars samaradorligini oshirish bo‘yicha qanday maslahat berasiz?",
                "question_en": "What advice do you offer to young educators to boost lesson effectiveness?",
                "answer_uz": "Har bir darsni qiziqarli muammo yoki amaliy hayotiy misol bilan boshlang. Interaktiv usullardan, zamonaviy texnologiyalardan foydalaning va har bir o‘quvchining individual qobiliyatini hurmat qiling.",
                "answer_en": "Start every lesson with an intriguing real-world challenge. Use interactive methods and respect each pupil's individuality.",
                "order": 2
            }
        ]
    },
    {
        "alumnus_slug": "ravshanov-olim-poyonovich",
        "slug": "ravshanov-olim-poyonovich-bilan-suhbat",
        "title_uz": "Mahalla tizimi va jamoatchilik xizmatida mas’uliyat",
        "title_en": "Responsibility in the community system and public service",
        "intro_uz": "O‘zbekiston mahallalari uyushmasi viloyat boshqarmasi boshlig‘i, xalq deputati Olim Ravshanov bilan jamiyat manfaati, aholi murojaatlari bilan ishlash va faol fuqarolik pozitsiyasi haqida suhbat.",
        "intro_en": "Interview with community leader and regional council deputy Olim Ravshanov on serving the public, resolving grassroots issues, and active citizenship.",
        "pull_quote_uz": "Xalqqa xizmat qilish — har bir rahbar va ziyolining eng oliy insoniy burchidir.",
        "pull_quote_en": "Serving the people is the highest civic and moral duty of every leader and scholar.",
        "is_featured": False,
        "items": [
            {
                "question_uz": "O‘zbek filologiyasi yo‘nalishidagi ta’lim sizning jamoatchilik faoliyatingizga qanday yordam bermoqda?",
                "question_en": "How has your background in Uzbek philology aided your public and civic work?",
                "answer_uz": "Filologiya insonga so‘z qadrini, tinglash madaniyatini va odamlar bilan samimiy muloqot o‘rnatish san’atini o‘rgatadi. Aholi bilan har kungi muloqotda tushunarli, adolatli va mehrli so‘z eng asosiy ko‘prikdir.",
                "answer_en": "Philology instills the value of speech, attentive listening, and the art of genuine dialogue.",
                "order": 1
            },
            {
                "question_uz": "Yoshlarning jamiyat hayotidagi faolligini oshirish uchun nimalarga e’tibor berish kerak?",
                "question_en": "What is essential for fostering active youth participation in public life?",
                "answer_uz": "Yoshlarga ishonch bildirish, ularning tashabbuslarini qo‘llab-quvvatlash va mahallalarda ma’naviy-ma’rifiy loyihalarni ko‘paytirish zarur.",
                "answer_en": "Placing trust in young people, championing their initiatives, and expanding grassroots educational and cultural projects.",
                "order": 2
            }
        ]
    },
    {
        "alumnus_slug": "muratov-shuxrat-kaxarovich",
        "slug": "muratov-shuxrat-kaxarovich-bilan-suhbat",
        "title_uz": "Tadbirkorlikda innovatsiya va muvaffaqiyat formulasi",
        "title_en": "Innovation in entrepreneurship and the formula for success",
        "intro_uz": "“Alp Texno Servis” korxonasi rahbari Shuxrat Muratov bilan biznesda yangi texnologiyalarni joriy etish, risklarni boshqarish va sifatli jamoa shakllantirish haqida suhbat.",
        "intro_en": "An interview with business founder Shuxrat Muratov on implementing innovative technologies, managing risk, and building high-performance teams.",
        "pull_quote_uz": "Tadbirkorlik — faqat daromad olish emas, balki jamiyat uchun yangi ish o‘rinlari va foydali qiymat yaratishdir.",
        "pull_quote_en": "Entrepreneurship is not merely about profit, but creating meaningful jobs and lasting value for society.",
        "is_featured": True,
        "items": [
            {
                "question_uz": "O‘z biznesingizni boshlashda qanday to‘siqlarga duch kelgansiz va ularni qanday yenggansiz?",
                "question_en": "What obstacles did you face when launching your business, and how did you overcome them?",
                "answer_uz": "Boshlanishida moliyaviy resurslar va texnik baza cheklangan edi. Biroq aniq reja, sohani chuqur o‘rganish va mijozlar ishonchini qozonish orqali bosqichma-bosqich yirik loyihalarni amalga oshirishga erishdik.",
                "answer_en": "Initially, capital and equipment were tight. But through structured planning, deep domain research, and customer trust, we expanded steadily.",
                "order": 1
            },
            {
                "question_uz": "Biznes boshlamoqchi bo‘lgan yoshlarga qanday asosiy maslahatni berasiz?",
                "question_en": "What key advice do you give to young aspiring entrepreneurs?",
                "answer_uz": "Hech qachon xato qilishdan qo‘rqmang. Kichik qadamlardan boshlang, o‘z sohangizning ustasi bo‘ling va halollikni biznesingizning bosh qoidasi qilib belgilang.",
                "answer_en": "Never fear failure. Begin with small disciplined steps, master your craft, and make integrity your core business value.",
                "order": 2
            }
        ]
    },
    {
        "alumnus_slug": "xusan-temirov",
        "slug": "xusan-temirov-bilan-suhbat",
        "title_uz": "Jurnalistika etikasi va xolis axborot mas’uliyati",
        "title_en": "Journalism ethics and the responsibility of objective information",
        "intro_uz": "Faxriy media sohasi namoyandasi va teleradiojurnalist Xusan Temirov bilan o‘zbek jurnalistikasi tarixi, professional etika va zamonaviy media maydonidagi o‘zgarishlar haqida suhbat.",
        "intro_en": "A conversation with veteran broadcast journalist Xusan Temirov on the history of Uzbek media, professional ethics, and shifts in the modern information ecosystem.",
        "pull_quote_uz": "So‘zning mas’uliyati juda katta. Jurnalistning eng asosiy quroli — bu uning xolisligi va xalq oldidagi vijdonidir.",
        "pull_quote_en": "The power of words carries immense responsibility. A journalist's sharpest weapon is objectivity and integrity.",
        "is_featured": False,
        "items": [
            {
                "question_uz": "QarshiDUdagi tahsil yillaringiz sizda qanday ijodiy poydevor yaratgan?",
                "question_en": "How did your study years at KarSU lay your creative foundation?",
                "answer_uz": "Universitetda adabiyotimiz durdonalari, so‘z san’ati va publitsistika qonun-qoidalarini chuqur o‘rganganmiz. Ustozlarimiz har bir fikrni fakt bilan asoslashni va xalq tilida sodda, ta’sirchan yetkazishni uqtirishgan.",
                "answer_en": "We immersed ourselves in literary masterpieces, prose art, and the core laws of publicism, learning to ground every statement in verified facts.",
                "order": 1
            },
            {
                "question_uz": "Bugungi yosh jurnalist va blogerlarga qanday tilaklar va maslahatlaringiz bor?",
                "question_en": "What are your hopes and guidance for young journalists and content creators today?",
                "answer_uz": "Tezkorlik ortidan quvib, haqiqatni qurbon qilmang. Har doim manbani tekshiring, madaniyatli va hurmatli tilda muloqot qiling.",
                "answer_en": "Do not sacrifice truth in the rush for speed. Always verify sources and communicate with dignity and respect.",
    {
        "alumnus_slug": "panjiyev-maqsud-aliqulovich",
        "slug": "panjiyev-maqsud-aliqulovich-bilan-suhbat",
        "title_uz": "Zamonaviy maktab taʼlimi, pedagogik innovatsiyalar va yosh avlod tarbiyasi",
        "title_en": "Modern School Education, Pedagogical Innovations, and Youth Development",
        "intro_uz": "Qashqadaryo viloyati Maktabgacha va maktab taʼlimi boshqarmasi boshlig‘i o‘rinbosari, pedagogika fanlari bo‘yicha falsafa doktori (PhD) Maqsud Panjiyev bilan umumiy o‘rta taʼlim sifatini oshirish, o‘qituvchilar salohiyati va zamonaviy darsliklar xususida eksklyuziv suhbat.",
        "intro_en": "An exclusive interview with Maqsud Panjiyev, Deputy Head of the Department of Preschool and School Education of Kashkadarya Region, discussing education quality, teacher skills, and innovative pedagogical approaches.",
        "pull_quote_uz": "Taʼlimga kiritilgan har bir investitsiya — millatimizning ertangi taraqqiyoti va ravnaqi uchun qo‘yilgan eng mustahkam poydevordir.",
        "pull_quote_en": "Every investment in education is the strongest foundation for our nation's future development and prosperity.",
        "video_url": "https://youtu.be/FfCZG9dGNlU",
        "video_duration": "24:10",
        "is_featured": True,
        "items": [
            {
                "question_uz": "Qarshi davlat universitetidagi tahsil davri sizda qanday kasbiy va insoniy ko‘nikmalarni shakllantirdi?",
                "question_en": "What professional and personal skills did your education at KarSU instill in you?",
                "answer_uz": "Matematika fakultetidagi yillar menga chuqur mantiqiy fikrlash, har qanday murakkab vaziyatda tizimli yechim topish va o‘z ustimda to‘xtovsiz ishlash ko‘nikmasini berdi. Ustozlarimizning saboqlari va talabchanligi keyinchalik ham ilmiy tadqiqotlarimda, ham rahbarlik faoliyatimda doimiy mayoq bo‘ldi.",
                "answer_en": "My years in the Faculty of Mathematics developed my deep analytical thinking, systematic problem-solving mindset, and dedication to continuous self-improvement.",
                "order": 1
            },
            {
                "question_uz": "Bugungi kunda maktabgacha va maktab taʼlimi tizimida qanday asosiy islohotlar amalga oshirilmoqda?",
                "question_en": "What key reforms are currently being implemented in the preschool and school education system?",
                "answer_uz": "Bugungi kunda asosiy eʼtiborimiz darslarning amaliy yo‘naltirilganligini oshirish, zamonaviy axborot texnologiyalarini o‘quv jarayoniga integratsiya qilish hamda pedagog kadrlarimizning metodik mahoratini doimiy oshirishga qaratilgan.",
                "answer_en": "Our primary focus today is on increasing practical learning outcomes, integrating modern digital technologies into education, and consistently upgrading teachers' pedagogical expertise.",
                "order": 2
            }
        ]
    }
]

def seed_interviews():
    created_count = 0
    updated_count = 0
    for data in INTERVIEW_DATA:
        alumnus = AlumniProfile.objects.filter(slug=data["alumnus_slug"]).first()
        if not alumnus:
            print(f"Warning: Alumni {data['alumnus_slug']} not found, skipping...")
            continue
        
        interview, created = AlumniInterview.objects.update_or_create(
            slug=data["slug"],
            defaults={
                "alumnus": alumnus,
                "title_uz": data["title_uz"],
                "title_en": data["title_en"],
                "intro_uz": data["intro_uz"],
                "intro_en": data["intro_en"],
                "pull_quote_uz": data["pull_quote_uz"],
                "pull_quote_en": data["pull_quote_en"],
                "video_url": data.get("video_url", "https://youtu.be/Paq4yBvGxm0"),
                "video_duration": data.get("video_duration", "44:37"),
                "is_featured": data["is_featured"],
                "is_published": True,
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

        for item_data in data["items"]:
            InterviewItem.objects.update_or_create(
                interview=interview,
                order=item_data["order"],
                defaults={
                    "question_uz": item_data["question_uz"],
                    "question_en": item_data["question_en"],
                    "answer_uz": item_data["answer_uz"],
                    "answer_en": item_data["answer_en"],
                }
            )

    print(f"Interviews seeding completed! Created: {created_count}, Updated: {updated_count}. Total in DB: {AlumniInterview.objects.count()}")

if __name__ == "__main__":
    seed_interviews()
