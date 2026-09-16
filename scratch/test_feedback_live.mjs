import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/feedback", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  // Fill in the form
  await page.fill("#name", "Raximov Ogabek");
  await page.fill("#contact", "boburjonabduganiyev83@gmail.com");
  await page.fill("#message", "QarshiDU bitiruvchilari platformasi ajoyib ishlamoqda. Telegram bot orqali bildirishnoma yetkazildi.");

  // Click Submit
  await page.click("button[type='submit']");
  await page.waitForSelector(".feedback-success-card", { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log("SUCCESS: Feedback submitted and verified!");
  await browser.close();
}

run().catch(console.error);

