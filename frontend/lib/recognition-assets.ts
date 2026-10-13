import type { Alumni } from "@/types/alumni";

/** Original recognition artwork, indexed by the existing recognition title slug. */
export const recognitionAssets: Readonly<Record<string, string>> = {
  "qardu-iftixori": "/recognitions/01-qardu-iftixori.png",
  "ilm-fan-fidoyisi": "/recognitions/02-ilm-fan-fidoyisi.png",
  "ziyo-mashali": "/recognitions/03-ziyo-mashali.png",
  "yuksak-parvoz": "/recognitions/04-yuksak-parvoz.png",
  "ibrat": "/recognitions/05-ibrat.png",
  "istiqbol-yoshlari": "/recognitions/06-istiqbol-yoshlari.png",
  "ezgulik": "/recognitions/07-ezgulik.png",
  "oliyhimmat": "/recognitions/08-oliyhimmat.png",
  "marifat-hadyasi": "/recognitions/09-marifat-hadyasi.png",
};

export function getAlumniAwards(alumni: Alumni): string[] {
  const confirmed = (alumni.recognitions ?? alumni.card_honors ?? [])
    .filter(honor => honor.is_active !== false && (!honor.status || honor.status === "approved"))
    .flatMap(honor => recognitionAssets[honor.slug] ? [recognitionAssets[honor.slug].split("/").pop()!] : []);
  return [...new Set(confirmed)].slice(0, 5);
}
