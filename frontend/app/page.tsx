import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { AlumniCard } from "@/components/alumni/alumni-card";
import { Button } from "@/components/ui/button";
import { getFeatured } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Featured } from "@/types/alumni";
import { CommunityValue } from "@/components/home/community-value";
import { EditorialHighlights } from "@/components/home/editorial-highlights";
export default async function Home(){const locale=await getLocale();const t=getDictionary(locale);let featured:Featured[]=[];try{featured=await getFeatured()}catch{}return <>
<section className={`hero hero-v2 locale-${locale}`}>
  <picture className="hero-media" aria-hidden="true">
    <source media="(max-width: 599px)" srcSet="/images/hero5.png?v=3"/>
    <source media="(max-width: 767px)" srcSet="/images/hero4.png?v=3"/>
    <source media="(max-width: 1024px)" srcSet="/images/hero3.png?v=3"/>
    <source media="(max-width: 1439px)" srcSet="/images/hero2.png?v=3"/>
    <img src="/images/hero1.png?v=3" alt="" fetchPriority="high"/>
  </picture>
  <div className="container hero-grid"><div className="hero-content"><h1><span>{t.heroTitle}</span><span>{t.heroLine2}</span><em>{t.heroAccent}</em></h1><p>{t.heroDescription}</p><div className="hero-actions"><Button href="/directory">{t.findAlumni} <ArrowRight/></Button><Button href="/register" variant="secondary">{t.joinPlatform}</Button></div></div></div>
</section>
<section className="section featured-section" id="featured"><div className="container"><div className="section-heading"><div><span className="eyebrow gold">{t.universityPride}</span><h2>{t.featuredTitle}</h2><p>{t.featuredText}</p></div><Link href="/directory">{t.allAlumni} <ArrowRight/></Link></div>{featured.length?<div className="cards-grid">{featured.slice(0,3).map(item=><div key={item.id}><AlumniCard alumni={item.alumni} featured t={t}/><h4 className="story-title">{item.title}</h4><p className="story-copy">{item.short_description}</p></div>)}</div>:<div className="empty-state"><GraduationCap/><h3>{t.featuredEmpty}</h3><p>{t.featuredEmptyText}</p></div>}</div></section>
<CommunityValue locale={locale}/>
<EditorialHighlights locale={locale}/>
</>}
