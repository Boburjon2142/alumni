"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Alumni, AlumniPreview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { getAlumniPreview } from "@/lib/api";
import { RemoteImage } from "@/components/ui/remote-image";
import { AlumniQuickProfile } from "./alumni-quick-profile";

export function AlumniCardGrid({alumni,locale}:{alumni:Alumni[];locale:Locale}){
  const [slug,setSlug]=useState<string|null>(null);
  const [profile,setProfile]=useState<AlumniPreview|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);
  const triggerRef=useRef<HTMLButtonElement|null>(null);

  const load=(nextSlug:string)=>{
    setLoading(true);setError(false);setProfile(null);
    const controller=new AbortController();
    getAlumniPreview(nextSlug,controller.signal).then(setProfile).catch(err=>{if(err.name!=="AbortError")setError(true)}).finally(()=>setLoading(false));
    return controller;
  };

  useEffect(()=>{if(!slug)return;const controller=load(slug);return()=>controller.abort()},[slug]);
  const openProfile=(item:Alumni,event:React.MouseEvent<HTMLButtonElement>)=>{triggerRef.current=event.currentTarget;setSlug(item.slug)};
  const close=(open:boolean)=>{if(!open)setSlug(null)};

  return <>
    <div className="cards-grid directory-grid">{alumni.map(item=>{const initials=item.full_name.split(" ").map(part=>part[0]).slice(0,2).join("");return <button type="button" className="alumni-card alumni-card-minimal" onClick={event=>openProfile(item,event)} key={item.id} aria-label={`${item.full_name} profilini ko‘rish`}>
      <RemoteImage className="alumni-card-image" src={item.avatar||item.image_url} alt={item.image_alt||`${item.full_name} portreti`} fallback={initials} sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1180px) 33vw, 25vw"/>
      <span className="minimal-card-name">{item.full_name}</span><span className="minimal-card-hint" aria-hidden="true">Profilni ko‘rish <ArrowRight/></span>
    </button>})}</div>
    <AlumniQuickProfile open={!!slug} onOpenChange={close} profile={profile} loading={loading} error={error} onRetry={()=>slug&&load(slug)} locale={locale} returnFocus={()=>triggerRef.current?.focus()}/>
  </>;
}
