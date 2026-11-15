/**
 * Optional AI backend for the "Next Level assistant" chat on the website.
 * The site works without it (built-in assistant). Deploy this as a Cloudflare Worker
 * (or any serverless function), then set CONFIG.aiEndpoint in index.html to its URL.
 *
 * Environment variables (set as secrets, never in the website code):
 *   AI_API_URL   - an OpenAI-compatible chat completions URL
 *   AI_API_KEY   - the API key for that provider
 *   AI_MODEL     - the model name to use
 *   ALLOWED_ORIGIN - the website origin, e.g. https://yourname.github.io
 */
const SYSTEM = `You are the website assistant for Next Level Improvement, a home remodeling company
based in Centreville, Virginia. Services: kitchen remodeling, bathroom remodeling, flooring, house painting.
Phone and WhatsApp: (571) 674-3082. Be friendly, brief (2-4 sentences) and helpful.
Rules: never quote prices or promise dates; explain that a written estimate follows an on-site visit.
Do not invent licenses, insurance, warranties, financing or reviews; refer those questions to the team.
Encourage visitors to request an estimate or message the team on WhatsApp.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
    try {
      const { messages = [] } = await request.json();
      const history = messages.slice(-12).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 1500) }));
      const r = await fetch(env.AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.AI_API_KEY}` },
        body: JSON.stringify({ model: env.AI_MODEL, max_tokens: 300, messages: [{ role: "system", content: SYSTEM }, ...history] }),
      });
      const data = await r.json();
      const reply = data?.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ reply }), { headers: { ...cors, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ reply: "" }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }
  },
};
