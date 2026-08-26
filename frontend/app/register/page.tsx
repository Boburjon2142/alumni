import Link from "next/link";import { AuthForm } from "@/components/auth/auth-form";import { getDictionary,getLocale } from "@/lib/i18n";
export const metadata={title:"Ro‘yxatdan o‘tish"};
export default async function Register(){const t=getDictionary(await getLocale());return <section className="auth-page"><div className="auth-card"><span className="eyebrow">{t.joinCommunity}</span><h1>{t.registerTitle}</h1><p>{t.registerText}</p><AuthForm mode="register" t={t}/><p className="auth-switch">{t.hasAccount} <Link href="/login">{t.login}</Link></p></div></section>}
