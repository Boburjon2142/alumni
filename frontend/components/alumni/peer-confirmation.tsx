"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  ShieldCheck,
  UserCheck,
  X,
  AlertCircle,
} from "lucide-react";
import type { Alumni } from "@/types/alumni";
import { confirmAlumnus } from "@/lib/api";

interface PeerConfirmationProps {
  alumnus: Alumni;
  locale?: string;
}

export function PeerConfirmation({ alumnus, locale = "uz" }: PeerConfirmationProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [approvedBy, setApprovedBy] = useState<string | null>(alumnus.approved_by_name || null);
  const [isApproved, setIsApproved] = useState<boolean>(
    alumnus.approval_status === "approved" || Boolean(alumnus.verified)
  );

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await confirmAlumnus(alumnus.slug);
      setIsApproved(true);
      if (res.data?.approved_by) {
        setApprovedBy(res.data.approved_by);
      }
      setSuccessMsg(
        res.message ||
          "Bitiruvchi muvaffaqiyatli tasdiqlandi! Barcha bitiruvchilarga email va Telegram botning «Tasdiqlanganlar» bo‘limiga xabar yuborildi."
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Tasdiqlashda xatolik yuz berdi. Iltimos, tizimga kirganingizni va profilingiz tasdiqlanganini tekshiring."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="peer-confirmation-wrapper">
      {/* 1. Tasdiqlanganlik holati va kim tasdiqlaganligi */}
      {isApproved ? (
        <div className="alumni-endorsement-status">
          <span className="endorsement-pill verified">
            <BadgeCheck size={16} className="text-emerald-500" />
            <span>
              {approvedBy
                ? `Tasdiqlagan: ${approvedBy}`
                : "Rasman tasdiqlangan bitiruvchi"}
            </span>
          </span>
          <a
            href="https://t.me/qarshidu_alumni_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bot-directory-link"
            title="Telegram botning «Tasdiqlanganlar» bo‘limida ko‘rish"
          >
            <Send size={14} /> Botda «Tasdiqlanganlar»
          </a>
        </div>
      ) : (
        <div className="alumni-endorsement-status pending">
          <span className="endorsement-pill pending">
            <ShieldCheck size={16} />
            <span>Tasdiqlash kutilmoqda</span>
          </span>

          <button
            type="button"
            className="button button-sm button-confirm"
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              setOpen(true);
            }}
          >
            <UserCheck size={15} /> Bitiruvchini tasdiqlash
          </button>
        </div>
      )}

      {/* Tasdiqlash modal oynasi */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content auth-dialog-content">
            <div className="dialog-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "rgba(13, 148, 136, 0.12)",
                    color: "#0D9488",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                  }}
                >
                  <UserCheck size={24} />
                </div>
                <div>
                  <Dialog.Title className="dialog-title" style={{ margin: 0, fontSize: "1.15rem" }}>
                    Bitiruvchini tasdiqlash (Peer Confirmation)
                  </Dialog.Title>
                  <Dialog.Description className="dialog-description" style={{ margin: "2px 0 0 0" }}>
                    Hamjamiyat a’zosi sifatida safdoshingizni tasdiqlang
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button type="button" className="dialog-close-button" aria-label="Yopish">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {error && (
                <div className="form-error-banner" role="alert" style={{ marginBottom: "16px" }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(22, 163, 74, 0.12)",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px auto",
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0" }}>
                    Tasdiqlandi!
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    {successMsg}
                  </p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                    <a
                      href="https://t.me/qarshidu_alumni_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-primary button-sm"
                    >
                      <Send size={15} /> Botda ko‘rish
                    </a>
                    <button
                      type="button"
                      className="button button-secondary button-sm"
                      onClick={() => setOpen(false)}
                    >
                      Yopish
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      background: "var(--color-surface-subtle, #f8fafc)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-primary, #002B49)" }}>
                      {alumnus.full_name}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                      {alumnus.graduation_year ? `${alumnus.graduation_year}-yil bitiruvchisi` : "Bitiruvchi"}
                      {alumnus.faculty ? ` · ${alumnus.faculty}` : ""}
                    </div>
                  </div>

                  <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-text-muted)", margin: "0 0 16px 0" }}>
                    Ushbu shaxs haqiqatan ham Qarshi davlat universitetida tahsil olganini tasdiqlaysizmi?
                  </p>

                  <div
                    style={{
                      background: "rgba(13, 148, 136, 0.08)",
                      borderLeft: "3px solid #0D9488",
                      padding: "12px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      marginBottom: "22px",
                    }}
                  >
                    <strong>E’lon qilish tartibi:</strong>
                    <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
                      <li>Barcha mavjud tasdiqlangan bitiruvchilarga email xabarnoma boradi.</li>
                      <li>Telegram botning <strong>«Tasdiqlanganlar»</strong> bo‘limida e’lon qilinadi.</li>
                    </ul>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="button button-secondary button-sm"
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      className="button button-primary button-sm"
                      onClick={handleConfirm}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="button-spinner" /> Tasdiqlanmoqda...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Tasdiqlash va xabar yuborish
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
