"use client";

import * as Dialog from "@radix-ui/react-dialog";
import styles from "./management.module.css";

export function AdminDialog({ title, onClose, busy = false, children }: {
  title: string; onClose: () => void; busy?: boolean; children: React.ReactNode;
}) {
  return <Dialog.Root open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.dialog} aria-describedby={undefined}
        onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}>
        <Dialog.Title className={styles.dialogTitle}>{title}</Dialog.Title>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
