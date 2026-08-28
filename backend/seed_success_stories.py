import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile
from apps.editorial.models import SuccessStory, StorySection

stories_data = [
    {
        "alumnus_search": "Ravshanov Olim",
        "slug": "olim-ravshanov-ilmiy-tafakkurdan-jamoat-boshqaruvigacha",
        "title_uz": "Olim Ravshanov: Ilmiy tafakkurdan jamoat boshqaruvigacha",
        "title_en": "Olim Ravshanov: From Academic Rigor to Public Governance",
        "summary_uz": "Filologiya fakultetidan boshlangan ilmiy izlanishlar va mahallalar tizimida xonadonbay ishlash orqali jamoatchilik e’tirofiga erishish yo‘li.",
        "summary_en": "From philological scholarship to public governance and grassroots neighborhood development in Kashkadarya.",
        "student_takeaway_uz": "Har qanday ijtimoiy boshqaruvda inson omilini birinchi o‘ringa qo‘yish va ilmiy tahlilga tayanish.",
        "student_takeaway_en": "In any public governance, always prioritize human values and rely on deep analytical methods.",
        "is_featured": True,
        "sections": [
            {
                "kind": StorySection.Kind.UNIVERSITY,
                "order": 1,
                "heading_uz": "Boshlanish va ilm yo‘li",
                "heading_en": "Academic Roots and Scholarly Journey",
                "content_uz": "Filologiya fakultetida tahsil olib, o‘z faoliyatini universitetda oddiy o‘qituvchilikdan boshlagan. Ilmiy izlanishlarini to‘xtatmay, filologiya fanlari bo‘yicha falsafa doktori (PhD) ilmiy darajasini himoya qilgan.",
                "content_en": "After graduating from the Faculty of Philology, he began his career as an academic instructor at Karshi State University. Pursuing continuous research, he successfully defended his PhD in Philological Sciences.",
            },
            {
                "kind": StorySection.Kind.TURNING_POINT,
                "order": 2,
                "heading_uz": "Burilish nuqtasi",
                "heading_en": "The Turning Point",
                "content_uz": "Nazariy bilimlarni amaliy boshqaruvga ko‘chirib, yoshlar va maʼnaviyat sohasidagi loyihalarni muvofiqlashtirishga kirishgan.",
                "content_en": "Translating academic theory into practical management, he spearheaded key youth initiatives and cultural leadership programs.",
            },
            {
                "kind": StorySection.Kind.ACHIEVEMENTS,
                "order": 3,
                "heading_uz": "Muvaffaqiyat omili",
                "heading_en": "Key Success Factors",
                "content_uz": "Mahalla tizimida kabinetdan chiqib, bevosita xonadonlar bilan ishlash mexanizmini joriy qilgani. Uning boshqaruvidagi tizimli yondashuv Qashqadaryo viloyati mahallalar uyushmasi boshqarmasi rahbari va viloyat Kengashi deputati darajasiga olib chiqqan.",
                "content_en": "He pioneered proactive grassroots engagement in the mahalla system. His systematic approach elevated him to Head of the Kashkadarya Regional Mahalla Association and Deputy of the Regional Council.",
            },
        ],
    },
    {
        "alumnus_search": "Muratov Shuxrat",
        "slug": "shuhrat-muratov-formulalardan-yirik-sanoat-korxonasigacha",
        "title_uz": "Shuhrat Muratov: Formulalardan yirik sanoat korxonasigacha",
        "title_en": "Shuhrat Muratov: From Mathematical Formulas to Major Industrial Manufacturing",
        "summary_uz": "Matematika fakultetida olingan analitik qobiliyatlarni ishlab chiqarishga yo‘naltirib, «Alp Texno Servis» XK ga asos solish tajribasi.",
        "summary_en": "Transforming mathematical precision and analytical problem-solving into a leading home appliance manufacturing enterprise in Kashkadarya.",
        "student_takeaway_uz": "Matematik aniqlikdagi hisob-kitob, sifatga eʼtibor va tavakkaldan qo‘rqmaslik.",
        "student_takeaway_en": "Mathematical precision in calculation, uncompromising focus on quality, and courage to take calculated risks.",
        "is_featured": True,
        "sections": [
            {
                "kind": StorySection.Kind.UNIVERSITY,
                "order": 1,
                "heading_uz": "Boshlanish va biznesga qadam",
                "heading_en": "Early Beginnings and Stepping into Business",
                "content_uz": "Matematika fakultetini tamomlab, olingan analitik fikrlash qobiliyatini tadbirkorlik sohasiga yo‘naltirgan.",
                "content_en": "Graduating from the Faculty of Mathematics, he channeled his rigorous analytical thinking into private enterprise and industrial engineering.",
            },
            {
                "kind": StorySection.Kind.EARLY_CAREER,
                "order": 2,
                "heading_uz": "Qiyinchiliklar va rivojlanish",
                "heading_en": "Overcoming Challenges & Scaling Operations",
                "content_uz": "2005-yilda tashkil etilgan kichik xizmat ko‘rsatish ustaxonasi (“Alp Texno Servis”)ni bosqichma-bosqich kengaytirib, Qashqadaryoning o‘zida murakkab elektrotexnika va maishiy texnika ishlab chiqarish liniyalarini yo‘lga qo‘ygan.",
                "content_en": "Starting in 2005 from a modest technical workshop ('Alp Texno Servis'), he progressively scaled operations into state-of-the-art consumer electronics and appliance manufacturing lines in Karshi.",
            },
            {
                "kind": StorySection.Kind.ACHIEVEMENTS,
                "order": 3,
                "heading_uz": "Muvaffaqiyat omili",
                "heading_en": "Key Success Factors",
                "content_uz": "Viloyat bozorida importga qaramlikni kamaytirish, mahalliy ishlab chiqarish quvvatlarini yaratish va yuzlab yoshlarni ish bilan taʼminlash. Mehnatlari davlat darajasida eʼtirof etilib, nufuzli davlat mukofotiga sazovor bo‘lgan.",
                "content_en": "Substantially substituting imports with locally engineered products and creating hundreds of technical jobs for youth. His contributions earned high-level state recognition and prestigious honors.",
            },
        ],
    },
    {
        "alumnus_search": "Ashurova Sharofat",
        "slug": "sharofat-ashurova-unutilayotgan-merosni-asrashga-bagishlangan-hayot",
        "title_uz": "Sharofat Ashurova: Unutilayotgan merosni asrashga bag‘ishlangan hayot",
        "title_en": "Sharofat Ashurova: A Lifetime Dedicated to Preserving Cultural Heritage",
        "summary_uz": "Qashqadaryoning boy o‘tmishi, unutilayotgan madaniy obidalarini hujjatlashtirish va «Oltin meros» fondi orqali merosni asrab qolish yo‘li.",
        "summary_en": "Documenting regional folklore, historical monuments, and preserving cultural legacy through the 'Oltin Meros' Foundation.",
        "student_takeaway_uz": "O‘z milliy o‘zligiga, tarixi va madaniyatiga sadoqat insonni jamiyatda chinakam eʼtirofga olib keladi.",
        "student_takeaway_en": "Unwavering commitment to national identity, heritage, and culture earns lasting public respect and societal recognition.",
        "is_featured": True,
        "sections": [
            {
                "kind": StorySection.Kind.UNIVERSITY,
                "order": 1,
                "heading_uz": "Boshlanish va ijodiy izlanish",
                "heading_en": "Creative Search and Literary Foundation",
                "content_uz": "Filologik taʼlimdan so‘ng matbuot, tahririyat va o‘qituvchilik orqali xalq og‘zaki ijodi hamda viloyat tarixini o‘rganishga kirishgan.",
                "content_en": "Following her philological education at the university, she embarked on extensive research into folklore and regional history through journalism, publishing, and teaching.",
            },
            {
                "kind": StorySection.Kind.EARLY_CAREER,
                "order": 2,
                "heading_uz": "Hayotiy missiya",
                "heading_en": "A Life's Sacred Mission",
                "content_uz": "Qashqadaryoning boy o‘tmishi, unutilayotgan tarixiy obidalari va madaniy ziyoratgohlarini hujjatlashtirish, ularni keng ommaga yetkazishni o‘zining asosiy vazifasi deb bilgan.",
                "content_en": "She made it her life's calling to document historical shrines, architectural monuments, and forgotten cultural assets across the region for future generations.",
            },
            {
                "kind": StorySection.Kind.ACHIEVEMENTS,
                "order": 3,
                "heading_uz": "Muvaffaqiyat omili",
                "heading_en": "Key Success Factors",
                "content_uz": "“Oltin meros” xalqaro xayriya jamoat fondining viloyat bo‘limi rahbari hamda Yozuvchilar uyushmasi aʼzosi sifatida ko‘plab moddiy-madaniy yodgorliklarni asrab qolish, restavratsiya ishlariga jamoatchilik va homiylarni jalb qilish loyihalariga boshchilik qilgan.",
                "content_en": "As head of the regional branch of the 'Oltin Meros' Foundation and member of the Writers' Union, she mobilized conservation efforts, community restoration, and sponsorship for invaluable historic landmarks.",
            },
        ],
    },
    {
        "alumnus_search": "Nematov Sherzod",
        "slug": "sherzod-nematov-talabalikdan-rektorlikkacha-bolgan-akademik-yol",
        "title_uz": "Sherzod Nematov: Talabalikdan rektorlikkacha bo‘lgan akademik yo‘l",
        "title_en": "Sherzod Nematov: From University Student to Technical University Rector",
        "summary_uz": "Fizika-texnika fakulteti talabaligidan boshlangan ilmiy izlanishlar, DSc ilmiy darajasi va Qarshi davlat texnika universiteti rektori lavozimiga erishish tarixi.",
        "summary_en": "Academic career from physics student to PhD, DSc professor, and Rector of Karshi State Technical University.",
        "student_takeaway_uz": "Oliy taʼlimda muvaffaqiyatga erishish uchun sohani ich-ichidan bilish va tizimli mehnat talab etiladi.",
        "student_takeaway_en": "Achieving excellence in higher education requires deep insider knowledge of the field and disciplined, systematic work.",
        "is_featured": True,
        "sections": [
            {
                "kind": StorySection.Kind.UNIVERSITY,
                "order": 1,
                "heading_uz": "Boshlanish va ilmiy faoliyat",
                "heading_en": "Academic Inception and Scientific Research",
                "content_uz": "Qarshi davlat universitetining Fizika-texnika fakultetini tamomlab, shu sohada ilmiy-tadqiqot ishlarini davom ettirgan.",
                "content_en": "After graduating from the Faculty of Physics and Technology at Karshi State University, he dedicated himself to advanced scientific inquiry and engineering research.",
            },
            {
                "kind": StorySection.Kind.EARLY_CAREER,
                "order": 2,
                "heading_uz": "Karyera pillapoyalari",
                "heading_en": "Academic Milestones",
                "content_uz": "Oddiy o‘qituvchilikdan boshlab kafedra mudiri, dekan muovini, fakultet dekani hamda ilmiy ishlar bo‘yicha prorektorlik bosqichlarini bosib o‘tgan.",
                "content_en": "He ascended through the academic ranks from junior instructor to department chair, vice dean, faculty dean, and vice rector for research and innovations.",
            },
            {
                "kind": StorySection.Kind.ACHIEVEMENTS,
                "order": 3,
                "heading_uz": "Muvaffaqiyat omili",
                "heading_en": "Key Success Factors",
                "content_uz": "Ilmiy tadqiqotlarni faqat laboratoriyada qoldirmay, sanoat va amaliyot bilan bog‘lagan (DSc fan doktori va professorlik). Natijada mintaqaning bosh texnika oliygohi — Qarshi davlat texnika universiteti rektori lavozimiga tayinlangan.",
                "content_en": "He bridged laboratory research with industrial application (earning a Doctor of Technical Sciences and Full Professorship), leading to his appointment as Rector of the premier technical university in the region.",
            },
        ],
    },
    {
        "alumnus_search": "Xusan Temirov",
        "slug": "husan-temirov-viloyat-media-maydonining-ishonchli-ovozi",
        "title_uz": "Husan Temirov: Viloyat media maydonining ishonchli ovozi",
        "title_en": "Husan Temirov: The Trusted Voice of Regional Broadcasting",
        "summary_uz": "1982-yil bitiruvchisining teleradiodagi qirq yillik fidokorona mehnati, tahliliy dasturlari va o‘ziga xos jurnalistika maktabi.",
        "summary_en": "Four decades of dedicated broadcast journalism, insightful public affairs programming, and mentorship in Kashkadarya media.",
        "student_takeaway_uz": "Ishga vijdonan yondashish va o‘z auditoriyasi bilan samimiy muloqot o‘rnatish.",
        "student_takeaway_en": "Approach your work with unwavering integrity and cultivate genuine, heartfelt rapport with your audience.",
        "is_featured": True,
        "sections": [
            {
                "kind": StorySection.Kind.UNIVERSITY,
                "order": 1,
                "heading_uz": "Boshlanish va efir sari yo‘l",
                "heading_en": "Early Years and the Path to Broadcasting",
                "content_uz": "1982-yilda Filologiya fakultetini tamomlab, o‘z davrida viloyat teleradiosi tahririyatiga yosh mutaxassis sifatida kirib kelgan.",
                "content_en": "Graduating from the Faculty of Philology in 1982, he joined the regional television and radio editorial team as an enthusiastic young journalist.",
            },
            {
                "kind": StorySection.Kind.EARLY_CAREER,
                "order": 2,
                "heading_uz": "Ijodiy jasorat",
                "heading_en": "Creative Courage on Air",
                "content_uz": "Matbuot va teleradioda jonli efirlar, qishloq xo‘jaligi, ijtimoiy masalalar hamda oddiy mehnatkashlar hayotini yorituvchi tahliliy reportajlari bilan xalq mehrini qozongan.",
                "content_en": "He won wide public acclaim through live broadcasts and sharp analytical reporting on agriculture, social developments, and the everyday lives of hardworking citizens.",
            },
            {
                "kind": StorySection.Kind.ACHIEVEMENTS,
                "order": 3,
                "heading_uz": "Muvaffaqiyat omili",
                "heading_en": "Key Success Factors",
                "content_uz": "Jurnalistik etika, xolislik va samimiyatni birlamchi o‘ringa qo‘ygan holda, bir necha o‘n yillar davomida Qashqadaryo media makonida o‘z maktabini yarata olgan.",
                "content_en": "By prioritizing journalistic ethics, impartiality, and sincerity, he established a distinguished school of broadcasting in Kashkadarya over several decades.",
            },
        ],
    },
]

for data in stories_data:
    profile = AlumniProfile.objects.filter(full_name__icontains=data["alumnus_search"].split()[0]).first()
    if not profile:
        print(f"Profile not found for {data['alumnus_search']}")
        continue

    # Delete existing story with same slug or alumnus if any
    SuccessStory.objects.filter(slug=data["slug"]).delete()
    SuccessStory.objects.filter(alumnus=profile).delete()

    story = SuccessStory.objects.create(
        alumnus=profile,
        slug=data["slug"],
        title_uz=data["title_uz"],
        title_en=data["title_en"],
        summary_uz=data["summary_uz"],
        summary_en=data["summary_en"],
        student_takeaway_uz=data["student_takeaway_uz"],
        student_takeaway_en=data["student_takeaway_en"],
        is_featured=data["is_featured"],
        is_published=True,
    )

    for sec in data["sections"]:
        StorySection.objects.create(
            story=story,
            kind=sec["kind"],
            order=sec["order"],
            heading_uz=sec["heading_uz"],
            heading_en=sec["heading_en"],
            content_uz=sec["content_uz"],
            content_en=sec["content_en"],
        )

    print(f"Created Success Story: '{story.title_uz}' for {profile.full_name}")

print("All 5 success stories created successfully!")

