// Bubbles' Gehirn: ein Cloudflare Worker zwischen der Website und der Claude API.
// Der API-Schluessel bleibt hier als Secret, die Website sieht ihn nie.
// Was Bubbles ueber das Spiel weiss, liest er live aus CHANGELOG.md der Website,
// er ist also nach jedem Release von selbst auf dem neuesten Stand.
import Anthropic from "@anthropic-ai/sdk";

const PERSONA = `You are Bubbles, the small, friendly diver mascot on the official website of Jayraid.
Jayraid is a hexagon voxel adventure for Windows by Tixx from Paco Interactive, currently in a closed alpha.
Tixx is the creator: he makes the game, the launcher, this website and you, Bubbles.

How you talk:
- Short: two to four sentences, plain text, no Markdown, no lists.
- Answer in the language the visitor writes in (usually English or German).
- Cheerful and a little cheeky, sometimes a "blub", never over the top.
- Only talk about Jayraid, this website, installing and playing it. For anything else, say kindly that you only know about Jayraid and offer a fun fact about the game instead.
- Never make up features, dates, prices or plans. If the changelog and the facts below don't say it, say you don't know and that the testers or Tixx might.
- Never claim to be a human. If asked, you are Bubbles, an AI diver on this page.

Facts about the website and the alpha:
- Closed alpha with 20 tester places. Click CLAIM A PLACE at the top of the page: the browser saves a personal code file and Jayraid-Launcher.zip. Testing is free.
- Windows 10 or 11 only. Mac, Linux and phones: the browser preview on itch.io (one island, no download).
- Install: the free .NET 8 Desktop Runtime (x64) once, unpack the launcher into its own folder, start Jayraid-Launcher.exe. If Windows warns: More info, then Run anyway. Enter the code or drop the file on the window, then INSTALL and PLAY.
- New versions appear as a big UPDATE button. The launcher updates itself the same way and checks every file against a signed version list before each start.
- Controls: WASD walk, Shift sprint, Space jump, sprint in deep water to swim. Left mouse: mine, strike. Right mouse: place, sabre thrust, throw. Both mouse buttons: block a hit. 1 to 0 or the mouse wheel: hotbar. I: inventory. Q + right mouse: throw the block in your hand. T torch, R golden wand, C green cave wand. E: trade, open a chest, hand your companion a sabre. Y: story goals on or off. Esc pause, F11 full screen.
- Divers only attack when you strike first or during a blood moon raid. Traders are friendly until you take the golden wand from the bell on their ship.
- The game is also available in German.`;

const MAX_TURNS = 12, MAX_CHARS = 600;
const hits = new Map(); // grobe Bremse pro IP und Worker-Instanz

let knowledge = { text: "", at: 0 };
async function changelog(env) {
  if (knowledge.text && Date.now() - knowledge.at < 3600e3) return knowledge.text;
  try {
    const r = await fetch(env.SITE + "/CHANGELOG.md", { cf: { cacheTtl: 3600 } });
    if (r.ok) knowledge = { text: await r.text(), at: Date.now() };
  } catch (e) { /* ohne Changelog antwortet er nur mit den festen Fakten */ }
  return knowledge.text;
}

function cors(env, origin) {
  return {
    "Access-Control-Allow-Origin": origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

// Nur ein sauberer Wechsel aus user/assistant mit kurzen Texten kommt durch.
function clean(messages) {
  if (!Array.isArray(messages)) return null;
  const list = messages.slice(-MAX_TURNS)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (list.length && list[0].role !== "user") list.shift();
  for (let i = 1; i < list.length; i++) if (list[i].role === list[i - 1].role) return null;
  return list.length && list[list.length - 1].role === "user" ? list : null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(env, origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, headers);
    if (origin !== env.ALLOWED_ORIGIN) return json({ error: "Not allowed" }, 403, headers);

    const ip = request.headers.get("CF-Connecting-IP") || "?";
    const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 600e3);
    if (recent.length >= Number(env.MAX_PER_10_MIN || 20)) return json({ error: "Slow down" }, 429, headers);
    recent.push(now);
    hits.set(ip, recent);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "Bad JSON" }, 400, headers); }
    const messages = clean(body.messages);
    if (!messages) return json({ error: "Bad messages" }, 400, headers);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const log = await changelog(env);
      const response = await client.beta.messages.create({
        model: env.MODEL || "claude-opus-5-5",
        max_tokens: 1024,
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        // Gleichbleibender Anfang (Persona + Changelog) wird zwischengespeichert, das spart Kosten.
        system: [
          { type: "text", text: PERSONA },
          { type: "text", text: "The full changelog of Jayraid, newest first:\n\n" + log, cache_control: { type: "ephemeral" } }
        ],
        messages
      });
      if (response.stop_reason === "refusal") {
        return json({ reply: "Blub. That's not something I can help with. Ask me about Jayraid!" }, 200, headers);
      }
      const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      return json({ reply: reply || "Blub?" }, 200, headers);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json({ error: "Busy" }, 503, headers);
      if (err instanceof Anthropic.APIError) return json({ error: "AI error " + err.status }, 502, headers);
      return json({ error: "Unknown error" }, 500, headers);
    }
  }
};
