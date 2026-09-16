import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "8925895219:AAGFBC5vcpVHlLEJXukWYZPSJV0bK2PWlL4";
const TELEGRAM_ADMIN_CHAT_ID =
  process.env.TELEGRAM_ADMIN_CHAT_ID || "-1003901101723";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, contact, message, page_url, page_type, alumni, story } = body || {};

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { detail: "Xabar matni kamida 5 ta belgidan iborat bo‘lishi kerak." },
        { status: 400 }
      );
    }

    // 1. Send to Django Backend API (persist in DB)
    const baseUrls = [
      process.env.API_URL,
      "http://backend:8000/api/v1",
      "http://127.0.0.1:8000/api/v1",
    ].filter(Boolean) as string[];

    for (const base of baseUrls) {
      try {
        const res = await fetch(`${base.replace(/\/$/, "")}/feedback/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
          cache: "no-store",
        });
        if (res.ok) break;
      } catch (err) {
        console.error(`Django feedback save error on ${base}:`, err);
      }
    }

    // 2. Direct Telegram notification guarantee
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
      try {
        const typeLabels: Record<string, string> = {
          question: "❓ Savol",
          proposal: "💡 Taklif",
          error_report: "⚠️ Ma’lumotdagi xato",
          additional_info: "📝 Qo‘shimcha ma’lumot",
          other: "📌 Boshqa",
        };

        const typeStr = typeLabels[type] || type || "Taklif";
        let text = `<b>📩 Yangi QarshiDU Alumni murojaati</b>\n\n`;
        text += `<b>Turi:</b> ${escapeHtml(typeStr)}\n`;
        if (name) text += `<b>Ism:</b> ${escapeHtml(name)}\n`;
        if (contact) text += `<b>Aloqa:</b> ${escapeHtml(contact)}\n`;
        if (page_url) text += `<b>Sahifa:</b> ${escapeHtml(page_url)}\n`;
        text += `\n<b>Xabar:</b>\n<i>${escapeHtml(message.trim())}</i>\n`;
        text += `\n📅 Sana: ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_ADMIN_CHAT_ID,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
      } catch (tgErr) {
        console.error("Direct Telegram send error:", tgErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Murojaatingiz qabul qilindi. Taklif va fikringiz uchun rahmat!",
        data: {
          type: type || "proposal",
          name: name || "",
          contact: contact || "",
          message: message.trim(),
          page_url: page_url || "",
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { detail: "Murojaatni qayta ishlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

