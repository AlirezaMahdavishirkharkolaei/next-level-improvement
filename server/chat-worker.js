/**
 * AI backend for the "Next Level assistant" chat on the Next Level Improvement website.
 * Runs on Cloudflare Workers with Workers AI (no external API key needed).
 *
 * Setup (Cloudflare dashboard):
 *   1. Workers & Pages > Create > Worker > deploy, then "Edit code" and paste this file.
 *   2. Settings > Bindings > Add > Workers AI, variable name: AI
 *   3. Settings > Variables > ALLOWED_ORIGIN = https://alirezamahdavishirkharkolaei.github.io
 *   4. Put the worker URL in index.html: CONFIG.aiEndpoint
 */
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";

const SYSTEM = `You are the friendly website assistant for Next Level Improvement, a home remodeling company
based in Centreville, Virginia, serving Centreville and the surrounding areas.
Services: kitchen remodeling (cabinets, countertops, backsplash, fixtures, layout updates), bathroom remodeling
(showers, tubs, vanities, tile, fixtures), flooring (hardwood, luxury vinyl plank, laminate, tile) and house painting
(interior and exterior). Process: a short call, an on-site visit, a clear written estimate and schedule, then the work
and a final walkthrough. Contact: phone and WhatsApp (571) 674-3082.
Rules:
- Reply in the visitor's language, in 2-4 short sentences, warm and professional. Plain text, no markdown.
- Never quote prices, price ranges or exact durations; explain that a written estimate follows an on-site visit.
- Never invent licenses, insurance, warranties, financing, reviews, years in business or team details;
  say the team will share those details directly.
- Only discuss the company, home improvement and the visitor's project. Politely decline unrelated topics.
- When it fits, invite the visitor to request an estimate in this chat or to message the team on WhatsApp.`;

function cors(env, origin) {
  const allowed = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowed === "*" ? "*" : (origin === allowed ? allowed : allowed),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
const json = (obj, headers, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(env, origin);
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method === "GET") return json({ ok: true, service: "Next Level assistant" }, headers);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, headers, 405);
    if (env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== "*" && origin !== env.ALLOWED_ORIGIN) return json({ reply: "" }, headers, 403);

    let body;
    try { body = await request.json(); } catch { return json({ reply: "" }, headers, 400); }
    const history = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-10)
      .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 1200) }))
      .filter(m => m.content);
    if (!history.length) return json({ reply: "" }, headers);

    const messages = [{ role: "system", content: SYSTEM }, ...history];
    for (const model of [MODEL, FALLBACK_MODEL]) {
      try {
        const out = await env.AI.run(model, { messages, max_tokens: 260, temperature: 0.4 });
        const reply = (out && (out.response || out.result?.response) || "").trim();
        if (reply) return json({ reply }, headers);
      } catch (e) { /* try the next model */ }
    }
    return json({ reply: "" }, headers);
  },
};
