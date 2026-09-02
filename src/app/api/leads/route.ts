import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { DomainError } from "@/lib/domain/errors";
import { FixedWindowRateLimiter } from "@/lib/rate-limit";
import { notifyLeadCreated } from "@/lib/lead-notification";
import { directLeadSchema } from "@/lib/validation";
import { getRequestOriginDomain } from "@/lib/request-domain";

const limiter = new FixedWindowRateLimiter(8, 60_000);

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 16_384) return NextResponse.json({ message: "Объём данных слишком большой" }, { status: 413 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rate = limiter.attempt(key);
  if (!rate.allowed) return NextResponse.json({ message: "Слишком много попыток. Попробуйте позднее." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  let body: unknown;
  try { body = JSON.parse(await request.text()); } catch { return NextResponse.json({ message: "Некорректный формат данных" }, { status: 400 }); }
  const parsed = directLeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Проверьте заполнение формы", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  try {
    const result = await (await getStore()).createLead(parsed.data, getRequestOriginDomain(request));
    if (result.created) {
      await notifyLeadCreated(result.lead);
      if (process.env.CRM_WEBHOOK_URL) fetch(process.env.CRM_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "lead.created", lead: result.lead }) }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, id: result.lead.id }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof DomainError) return NextResponse.json({ message: error.message, code: error.code, errors: error.fieldErrors }, { status: error.status });
    console.error("lead.create.failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ message: "Не удалось сохранить обращение. Попробуйте ещё раз позднее." }, { status: 500 });
  }
}
