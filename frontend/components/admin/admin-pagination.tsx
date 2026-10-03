import styles from "./management.module.css";

export function AdminPagination({ page, count, onChange, loading }: {
  page: number; count: number; onChange: (page: number) => void; loading: boolean;
}) {
  const pages = Math.max(1, Math.ceil(count / 20));
  if (pages === 1) return null;
  return <nav className={styles.pagination} aria-label="Sahifalar">
    <span>Jami {count} ta · {page} / {pages} sahifa</span>
    <div>
      <button disabled={loading || page <= 1} onClick={() => onChange(page - 1)}>Oldingi</button>
      <button disabled={loading || page >= pages} onClick={() => onChange(page + 1)}>Keyingi</button>
    </div>
  </nav>;
}
