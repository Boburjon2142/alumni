import Link from "next/link";import { AuthForm } from "@/components/auth/auth-form";import { getDictionary,getLocale } from "@/lib/i18n";
export const metadata={title:"Kirish"};
export default async function Login(){const t=getDictionary(await getLocale());return <section className="auth-page"><div className="auth-card"><span className="eyebrow">{t.welcome}</span><h1>{t.loginTitle}</h1><p>{t.loginText}</p><AuthForm mode="login" t={t}/><p className="auth-switch">{t.noAccount} <Link href="/register">{t.register}</Link></p></div></section>}
