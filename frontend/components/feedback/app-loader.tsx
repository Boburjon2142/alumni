import type { CSSProperties } from "react";
import styles from "./app-loader.module.css";

interface AppLoaderProps {
  /** Optional exit state for consumers that manage their own loading lifecycle. */
  fading?: boolean;
  fadeDurationMs?: number;
}

/** Full-screen brand fallback. CSS handles motion; no client runtime is needed. */
export function AppLoader({ fading = false, fadeDurationMs = 200 }: AppLoaderProps) {
  return (
    <section
      className={`${styles.screen}${fading ? ` ${styles.fading}` : ""}`}
      style={{ "--loader-exit-duration": `${fadeDurationMs}ms` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Bitiruvchilar hamjamiyati yuklanmoqda..."
      lang="uz"
      data-app-loader=""
      data-fading={fading || undefined}
    >
      <div className={styles.content}>
        <img
          className={styles.logo}
          src="/brand/logo-oz-light.svg"
          alt="Qarshi davlat universiteti"
          width={332}
          height={188}
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.text}>
          <h1 className={styles.title}>ALUMNI PLATFORMASI</h1>
          <p className={styles.subtitle}>Bitiruvchilar hamjamiyati yuklanmoqda...</p>
        </div>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.highlight} />
        </div>
      </div>
    </section>
  );
}
