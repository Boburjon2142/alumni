import Link from "next/link";
import { ArrowLeft, Quote } from "lucide-react";
import { notFound } from "next/navigation";
import { getInterview } from "@/lib/api";
import { getLocale } from "@/lib/i18n";

export default async function InterviewDetail({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const locale=await getLocale();const en=locale==="en";let interview;try{interview=await getInterview(slug)}catch{return notFound()}return <article className="interview-detail"><header className="interview-hero"><div className="container"><Link className="breadcrumb-back" href="/stories"><ArrowLeft/> {en?"Stories":"Hikoyalar"}</Link><span className="eyebrow">{en?"Alumni interview":"Bitiruvchi bilan intervyu"}</span><h1>{(en&&interview.title_en)||interview.title_uz}</h1><p>{(en&&interview.intro_en)||interview.intro_uz}</p><Link href={`/alumni/${interview.alumnus.slug}`}>{interview.alumnus.full_name}</Link></div></header><div className="container interview-body">{((en&&interview.pull_quote_en)||interview.pull_quote_uz)&&<blockquote><Quote/><p>{(en&&interview.pull_quote_en)||interview.pull_quote_uz}</p></blockquote>}{interview.items?.map((item,index)=><section key={item.id}><span>{String(index+1).padStart(2,"0")}</span><h2>{(en&&item.question_en)||item.question_uz}</h2><p>{(en&&item.answer_en)||item.answer_uz}</p></section>)}</div></article>}
