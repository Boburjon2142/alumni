"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Award, BadgeCheck, Building2, ExternalLink, GraduationCap, Lightbulb, MapPin, X } from "lucide-react";
import type { AlumniPreview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { RemoteImage } from "@/components/ui/remote-image";

const copy = {
  uz:{close:"Profil oynasini yopish",loading:"Profil yuklanmoqda",error:"Profil ma’lumotlarini yuklab bo‘lmadi.",retry:"Qayta urinish",verified:"Tasdiqlangan",about:"Qisqacha",timeline:"Faoliyat yo‘li",achievements:"Asosiy yutuqlar",advice:"Talabalarga maslahat",sources:"Tasdiqlangan manbalar",full:"To‘liq profilni ko‘rish",graduate:"QarDU bitiruvchisi"},
  ru:{close:"Закрыть профиль",loading:"Профиль загружается",error:"Не удалось загрузить профиль.",retry:"Повторить",verified:"Подтвержден",about:"Кратко",timeline:"Карьерный путь",achievements:"Достижения",advice:"Совет студентам",sources:"Источники",full:"Открыть полный профиль",graduate:"Выпускник КарГУ"},
  en:{close:"Close profile",loading:"Loading profile",error:"Unable to load the profile.",retry:"Try again",verified:"Verified",about:"Overview",timeline:"Career timeline",achievements:"Key achievements",advice:"Advice for students",sources:"Verified sources",full:"View full profile",graduate:"KarSU alumnus"},
} as const;

export function AlumniQuickProfile({open,onOpenChange,profile,loading,error,onRetry,locale,returnFocus}:{open:boolean;onOpenChange:(open:boolean)=>void;profile:AlumniPreview|null;loading:boolean;error:boolean;onRetry:()=>void;locale:Locale;returnFocus:()=>void}){
  const t=copy[locale];
  const initials=profile?.full_name.split(" ").map(part=>part[0]).slice(0,2).join("")||"Q";
  const bio=profile ? ((locale==="en"&&profile.biography_en)||profile.biography_uz||profile.bio) : "";
  const advice=profile?.advice ? ((locale==="en"&&profile.advice.content_en)||profile.advice.content_uz) : "";
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="quick-profile-overlay"/>
      <Dialog.Content className="quick-profile" onCloseAutoFocus={(event)=>{event.preventDefault();returnFocus()}} aria-describedby={profile?"quick-profile-description":undefined}>
        <Dialog.Close className="quick-profile-close" aria-label={t.close}><X aria-hidden="true"/></Dialog.Close>
        {loading&&<div className="quick-profile-skeleton" aria-live="polite"><span className="sr-only">{t.loading}</span><div/><div><i/><i/><i/></div></div>}
        {!loading&&error&&<div className="quick-profile-error" role="alert"><p>{t.error}</p><button type="button" onClick={onRetry}>{t.retry}</button></div>}
        {!loading&&!error&&profile&&<>
          <header className="quick-profile-header">
            <RemoteImage className="quick-profile-photo" src={profile.avatar||profile.image_url} alt={profile.image_alt||`${profile.full_name} portreti`} fallback={initials} sizes="(max-width: 640px) 100vw, 280px"/>
            <div>
              {profile.verified&&<span className="quick-verified"><BadgeCheck aria-hidden="true"/>{t.verified}</span>}
              <Dialog.Title>{profile.full_name}</Dialog.Title>
              <Dialog.Description id="quick-profile-description">{profile.position||t.graduate}{profile.current_company&&` — ${profile.current_company}`}</Dialog.Description>
              <div className="quick-profile-facts">
                {(profile.faculty||profile.graduation_year)&&<span><GraduationCap/>{[profile.faculty,profile.graduation_year].filter(Boolean).join(" · ")}</span>}
                {(profile.city||profile.country)&&<span><MapPin/>{[profile.city,profile.country].filter(Boolean).join(", ")}</span>}
                {profile.industry&&<span><Building2/>{profile.industry}</span>}
              </div>
            </div>
          </header>
          <div className="quick-profile-body">
            {bio&&<section><h2>{t.about}</h2><p>{bio}</p></section>}
            {!!profile.timeline?.length&&<section><h2>{t.timeline}</h2><ol className="quick-timeline">{profile.timeline.map(item=><li key={item.id}><time>{item.year}</time><div><strong>{item.title}</strong>{item.organization&&<span>{item.organization}</span>}</div></li>)}</ol></section>}
            {!!profile.achievements?.length&&<section><h2>{t.achievements}</h2><ul className="quick-achievements">{profile.achievements.map(item=><li key={item.id}><Award/><span>{item.title}</span></li>)}</ul></section>}
            {advice&&<section className="quick-advice"><Lightbulb/><div><h2>{t.advice}</h2><p>{advice}</p></div></section>}
            {!!profile.sources?.length&&<section><h2>{t.sources}</h2><div className="quick-sources">{profile.sources.map(source=><a href={source.url} target="_blank" rel="noopener noreferrer" key={source.id}>{source.title}<ExternalLink/></a>)}</div></section>}
          </div>
          <footer className="quick-profile-footer"><Link href={`/alumni/${profile.slug}`}>{t.full}</Link></footer>
        </>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
