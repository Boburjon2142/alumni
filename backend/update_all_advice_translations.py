import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.alumni.models import AlumniProfile
from apps.editorial.models import AlumniAdvice

# Translations for all alumni advice
translations = {
    "Allayev Dolli Hakimovich": {
        "content_uz": "Ilm va ta’limga intilish — insonni doimo yuksak marralarga yetaklaydi. O‘z ustingizda tinimsiz ishlang va tanlagan sohangizning yetuk mutaxassisi bo‘ling.",
        "content_ru": "Стремление к науке и образованию всегда ведет человека к высоким достижениям. Неустанно работайте над собой и стремитесь стать ведущим экспертом в выбранной сфере.",
        "content_en": "The pursuit of knowledge and education always leads to great accomplishments. Work relentlessly on self-improvement and become a leading expert in your field.",
        "category": "academic"
    },
    "Panjiyev Maqsud Aliqulovich": {
        "content_uz": "Zamonaviy bilim, axborot texnologiyalari va kuchli intizom har qanday sohada muvaffaqiyat garovidir. Doimo yangilikka ochiq bo‘ling.",
        "content_ru": "Современные знания, информационные технологии и строгая дисциплина — залог успеха в любой отрасли. Всегда будьте открыты новым возможностям.",
        "content_en": "Modern knowledge, information technologies, and strong discipline are the keys to success in any domain. Always stay open to innovation.",
        "category": "leadership"
    },
    "Markayev Zafar Aliqulovich": {
        "content_uz": "Qat’iyat, jismoniy va ma’naviy yetuklik hamda Vatan oldidagi burchga sadoqat har bir yoshning hayotiy dasturilamali bo‘lishi lozim.",
        "content_ru": "Целеустремлённость, физическая и духовная зрелость, а также верность долгу перед Родиной должны быть главным жизненным ориентиром каждого молодого человека.",
        "content_en": "Determination, physical and moral integrity, and steadfast dedication to serving one's homeland should guide every young professional.",
        "category": "discipline"
    },
    "Qurbonov Oybek Abdusattorovich": {
        "content_uz": "Sanoat va iqtisodiyotda aniq maqsad, tizimli tahlil va qat’iy mehnat muvaffaqiyat keltiradi. Har bir loyihaga mas’uliyat bilan yondashing.",
        "content_ru": "В промышленности и экономике успех достигается четкими целями, системным анализом и упорным трудом. Подходите к каждому проекту с высокой ответственностью.",
        "content_en": "In industry and economy, success is driven by clear objectives, systematic analysis, and dedicated effort. Approach every project with utmost accountability.",
        "category": "career"
    },
    "Rajabov Alisher Hazratovich": {
        "content_uz": "Qonun ustuvorligi, halollik va adolatga sadoqat — huquqshunoslikning eng oliy qadriyatlaridir. O‘z prinsiplaringizda qat’iy turing.",
        "content_ru": "Верховенство закона, честность и преданность справедливости — высшие ценности юриспруденции. Будьте тверды в своих профессиональных принципах.",
        "content_en": "The rule of law, integrity, and dedication to justice are the highest ideals in law. Stand firm by your core values.",
        "category": "leadership"
    },
    "Ravshanov Olim Poyonovich": {
        "content_uz": "Mahalla — jamiyat tayanchi. Xalqimiz bilan hamnafas yashash, har bir insonning dardu tashvishi bilan qiziqish — eng oliy mas’uliyatdir.",
        "content_ru": "Махалля — основа общества. Жить в гармонии с народом и заботиться о благополучии каждого человека — наша высшая гражданская ответственность.",
        "content_en": "The neighborhood (mahalla) is the pillar of society. Living in harmony with people and addressing their needs is the highest public duty.",
        "category": "society"
    },
    "Xolmurodov Abdulhamid Erkinovich": {
        "content_uz": "Matematika va aniq fanlar inson tafakkurini charxlaydi. Doimiy izlanish va chuqur bilim orqali ilm-fanda yuksak natijalarga erishish mumkin.",
        "content_ru": "Математика и точные науки развивают гибкость мышления. Лишь благодаря непрерывному поиску и глубоким знаниям достигаются вершины науки.",
        "content_en": "Mathematics and exact sciences sharpen human intellect. Through continuous research and profound knowledge, one can reach the highest peaks of science.",
        "category": "academic"
    },
    "Muratov Shuxrat Kaxarovich": {
        "content_uz": "Tadbirkorlikda aniq hisob-kitob, yangilikka intilish va sifat eng muhim omildir. O‘z biznesingizda qat’iyatli bo‘ling.",
        "content_ru": "В предпринимательстве решающими факторами являются точный расчет, стремление к инновациям и бескомпромиссное качество. Будьте настойчивы в своем деле.",
        "content_en": "In entrepreneurship, precise calculation, striving for innovation, and quality are key factors. Be persistent in your vision.",
        "category": "business"
    },
    "Ashurova Sharofat Toshpo‘latovna": {
        "content_uz": "Milliy qadriyatlarimiz, boy tariximiz va adabiyotimizni asrab-avaylash, yosh avlod qalbiga vatanparvarlik va ma’naviyat tuyg‘ularini singdirish har birimizning sharafli burchimizdir.",
        "content_ru": "Сохранение нашего богатого историко-культурного наследия и литературы, воспитание патриотизма и высокой духовности у молодёжи — наш благородный долг.",
        "content_en": "Preserving our cultural heritage, rich history, and literature, while inspiring patriotism and spirituality in future generations, is our noble responsibility.",
        "category": "culture"
    },
    "Nematov Sherzod Qalandarovich": {
        "content_uz": "Muhandislik va zamonaviy texnologiyalar yurtimiz taraqqiyotining asosiy drayveridir. Amaliy ko‘nikma va ilmiy izlanishni uyg‘unlashtirgan mutaxassis har doim talabgir bo‘ladi.",
        "content_ru": "Инженерия и современные технологии — главный двигатель прогресса. Специалист, сочетающий практические навыки с научными исследованиями, всегда будет востребован.",
        "content_en": "Engineering and modern technologies are key drivers of development. Professionals who bridge hands-on skills with rigorous research will always be in high demand.",
        "category": "engineering"
    },
    "Nusurov Usmon Nusratovich": {
        "content_uz": "Jurnalistika — xolislik, teran mushohada va so‘z mas’uliyatini talab qiluvchi kasbdir. Doimo haqqoniy va xalq dardi bilan yozing.",
        "content_ru": "Журналистика требует беспристрастности, глубокого осмысления и высокой ответственности за каждое слово. Всегда пишите правдиво и во благо общества.",
        "content_en": "Journalism demands impartiality, deep reflection, and responsibility for the written word. Always remain truthful and devoted to public interest.",
        "category": "media"
    },
    "Xusan Temirov": {
        "content_uz": "Efir madaniyati, samimiyat va so‘z qudratini his etish — jurnalistikaning jon tomiridir. Tinglovchi va tomoshabin mehrini qozonish uchun doimo fidoyi bo‘ling.",
        "content_ru": "Культура эфира, искренность и чувство силы слова — душа журналистики. Чтобы завоевать признание аудитории, отдавайте профессии все сердце.",
        "content_en": "Broadcasting culture, sincerity, and mastering the power of language are the lifeblood of journalism. Dedicated service wins the audience's lasting trust.",
        "category": "media"
    }
}

for name, data in translations.items():
    profile = AlumniProfile.objects.filter(full_name__icontains=name.split()[0]).first()
    if profile:
        AlumniAdvice.objects.filter(alumnus=profile).delete()
        AlumniAdvice.objects.create(
            alumnus=profile,
            content_uz=data["content_uz"],
            content_ru=data["content_ru"],
            content_en=data["content_en"],
            category=data["category"],
            is_published=True,
            is_featured=True
        )
        print(f"Updated advice for {profile.full_name}")

print("All advice entries updated with UZ, RU, and EN translations!")

