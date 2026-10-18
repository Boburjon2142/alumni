"use client";

import { getRecognitionTitle, type Locale } from "@/lib/i18n";
import type { Recognition } from "@/types/alumni";
import { recognitionAssets } from "@/lib/recognition-assets";
import { RecognitionIcon } from "@/components/alumni/recognition-icon";
import styles from "./impact-award-gallery.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText } from "lucide-react";
import regulation from "@/lib/award-regulation.json";
import { RecognitionArtwork } from "@/components/alumni/recognition-artwork";

export function ImpactAwardGallery({ recognitions, locale }: { recognitions: Recognition[]; locale: Locale }) {
  return <section className={styles.gallery} aria-label={locale === "en" ? "Honorary awards" : locale === "ru" ? "Почётные награды" : "Faxriy unvonlar"}>
    {recognitions.map(honor => {
      const title = getRecognitionTitle(honor.slug, locale, honor.name);
      const src = recognitionAssets[honor.slug];
      const conditions = regulation.conditions[honor.slug as keyof typeof regulation.conditions];
      const blocks = regulation.blocks[honor.slug as keyof typeof regulation.blocks] as
        ({ type: "paragraph"; text: string } | { type: "list"; items: string[] })[] | undefined;
      return <Dialog.Root key={honor.slug}>
        <Dialog.Trigger asChild><button type="button" className={styles.item} aria-label={title}>
          <span className={styles.symbol}>{src ? <RecognitionArtwork src={src} sizes="(max-width: 480px) 120px, 160px" alt="" width={160} height={160} /> : <RecognitionIcon icon={honor.symbol_name || honor.icon} size={72} />}</span>
          <span className={styles.title}>{title}</span>
          {honor.description && <span className={styles.description}>{honor.description}</span>}
        </button></Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            <div className={styles.modalHeader}>
              <div><Dialog.Title className={styles.modalTitle}>{title}</Dialog.Title>
                <Dialog.Description className={styles.subtitle}>{locale === "en" ? "Award requirements from the regulation (Uzbek)" : locale === "ru" ? "Условия награждения из положения (на узбекском)" : "Nizom bo‘yicha unvon berilish shartlari"}</Dialog.Description></div>
              <Dialog.Close className={styles.close} aria-label={locale === "en" ? "Close" : locale === "ru" ? "Закрыть" : "Yopish"}><X size={18} /></Dialog.Close>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.requirements}>{blocks ? blocks.map((block, index) => block.type === "list"
                ? <ul key={index} className={styles.requirementList}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
                : <p key={index}>{block.text}</p>)
                : <p>{conditions || honor.eligibility_summary}</p>}</div>
              <details className={styles.common}><summary>{locale === "en" ? "General requirements (Uzbek)" : locale === "ru" ? "Общие требования (на узбекском)" : "Umumiy talablar va taqdirlash tartibi"}</summary><p className={styles.conditions}>{regulation.common}</p></details>
            </div>
            <div className={styles.modalFooter}><a href={regulation.source} target="_blank" rel="noopener noreferrer"><FileText size={16} />{locale === "en" ? "Open regulation PDF" : locale === "ru" ? "Открыть положение PDF" : "Nizom PDF hujjatini ochish"}</a></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>;
    })}
  </section>;
}
