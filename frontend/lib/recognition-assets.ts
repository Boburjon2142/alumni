import type { Alumni, Recognition } from "@/types/alumni";

export function sortRecognitions(honors: Recognition[]): Recognition[] {
  const dateValue = (honor: Recognition) => {
    const value = Date.parse(honor.awarded_at || (honor.year ? `${honor.year}-01-01` : ""));
    return Number.isNaN(value) ? 0 : value;
  };
  return [...honors].filter(h => h.is_active !== false && (!h.status || h.status === "approved"))
    .sort((a, b) => dateValue(b) - dateValue(a) || (b.assignment_id ?? b.id) - (a.assignment_id ?? a.id));
}

export function getCardRecognitions(alumni: Alumni): Recognition[] {
  const honors = sortRecognitions(alumni.recognitions ?? alumni.card_honors ?? []);
  if (alumni.card_honors !== undefined) {
    const latest = sortRecognitions(alumni.card_honors)[0];
    if (!latest) return [];
    return [latest, ...honors.filter(h => h.slug !== latest.slug)];
  }
  return honors;
}

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
  const confirmed = getCardRecognitions(alumni)
    .flatMap(honor => recognitionAssets[honor.slug] ? [recognitionAssets[honor.slug].split("/").pop()!] : []);
  return [...new Set(confirmed)].slice(0, 5);
}
