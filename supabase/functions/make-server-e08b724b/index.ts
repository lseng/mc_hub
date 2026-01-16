// supabase/functions/make-server/index.ts
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const SB_URL  = Deno.env.get("SB_URL") || Deno.env.get("SUPABASE_URL")!;
const SB_ANON = Deno.env.get("SB_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
const SB_SVC  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || SB_ANON; // prefer service role
const FUNCS   = `${SB_URL}/functions/v1`;
const REST    = `${SB_URL}/rest/v1`;
const GEMINI  = Deno.env.get("GEMINI_API_KEY") || "";

const ALLOW = new Set([
  "chat",
  "rag-search",
  "embed-and-upsert",
  "summarize-resource",
  "add-resource-from-url",
  "ingest-from-text",
  "ingest-from-youtube-url",
  "ingest-url",
  "kb-query",
]);

const app = new Hono();
app.use("*", logger());
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["content-type","authorization","apikey","x-client-info"],
  allowMethods: ["GET","POST","OPTIONS"],
}));

// collapse accidental double segment
app.use("*", async (c, next) => {
  const fixed = c.req.path.replace(/\/make-server-e08b724b\/make-server-e08b724b/, "/make-server-e08b724b");
  if (fixed !== c.req.path) return c.redirect(fixed + (new URL(c.req.url).search || ""), 308);
  await next();
});

app.get("/make-server-e08b724b/health", c => c.json({ status: "ok" }));

// ---------- Featured resources via PostgREST ----------
app.get("/make-server-e08b724b/resources", async (c) => {
  const url = new URL(`${REST}/resource`);
  url.searchParams.set("select","id,title,type,section,url,description,date_added,roles,tags,thumbnail_url,position");
  // published true or null
  url.searchParams.set("or","(is_published.eq.true,is_published.is.null)");
  url.searchParams.set("order","position.nullslast");
  url.searchParams.append("order","date_added.desc");
  url.searchParams.set("limit","50");

  const r = await fetch(url, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` }
  });
  return new Response(r.body, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") ?? "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// ---------- Clean aliases to internal functions ----------

// /chat -> functions/v1/chat  (normalize answer -> text)
app.post("/make-server-e08b724b/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const upstream = await fetch(`${FUNCS}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
    },
    body: JSON.stringify(body || {}),
  });

  const raw = await upstream.json().catch(() => ({}));
  if (raw && typeof raw === "object") {
    // ensure UI can always read `text`
    raw.text = raw.text ?? raw.answer ?? "";
  }
  return new Response(JSON.stringify(raw), {
    status: upstream.status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// /search -> functions/v1/rag-search (straight pass-through)
app.post("/make-server-e08b724b/search", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const upstream = await fetch(`${FUNCS}/rag-search`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
    },
    body: JSON.stringify(body || {}),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// /ingest -> functions/v1/ingest-url (straight pass-through)
app.post("/make-server-e08b724b/ingest", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const r = await fetch(`${FUNCS}/ingest-url`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
    },
    body: JSON.stringify(body || {}),
  });
  const txt = await r.text();
  return new Response(txt, {
    status: r.status,
    headers: { 
      "content-type": r.headers.get("content-type") ?? "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// /ingest-url -> functions/v1/ingest-url (direct alias for explicit frontend calls)
app.post("/make-server-e08b724b/ingest-url", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const r = await fetch(`${FUNCS}/ingest-url`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
    },
    body: JSON.stringify(body || {}),
  });
  const txt = await r.text();
  return new Response(txt, {
    status: r.status,
    headers: { 
      "content-type": r.headers.get("content-type") ?? "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// /kb-query -> functions/v1/kb-query (straight pass-through)
app.post("/make-server-e08b724b/kb-query", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const r = await fetch(`${FUNCS}/kb-query`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
    },
    body: JSON.stringify(body || {}),
  });
  const txt = await r.text();
  return new Response(txt, {
    status: r.status,
    headers: { 
      "content-type": r.headers.get("content-type") ?? "application/json",
      "access-control-allow-origin": "*",
    }
  });
});

// ---------- Wildcard proxy to other functions ----------
app.all("/make-server-e08b724b/api/*", async (c) => {
  if (c.req.method === "OPTIONS") return c.text("ok");
  const after = c.req.path.replace(/^\/make-server-e08b724b\/api\//, "");
  const [fnName, ...rest] = after.split("/");
  if (!ALLOW.has(fnName)) return c.text("Not allowed", 404);
  const target = `${FUNCS}/${fnName}/${rest.join("/")}${new URL(c.req.url).search}`;
  const headers: Record<string,string> = {
    "content-type": c.req.header("content-type") ?? "application/json",
    apikey: SB_SVC, // internal calls with service role
    authorization: c.req.header("authorization") ?? `Bearer ${SB_SVC}`,
  };
  const body = ["GET","HEAD","OPTIONS"].includes(c.req.method) ? undefined : await c.req.arrayBuffer();
  const upstream = await fetch(target, { method: c.req.method, headers, body });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "access-control-allow-origin": "*",
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    }
  });
});

// ---------- Google Docs proxy ----------
app.post("/make-server-e08b724b/render-doc", async (c) => {
  const { url } = await c.req.json().catch(()=>({}));
  
  console.log(`Google Docs proxy request for URL: ${url}`);
  
  // Check if URL is provided
  if (!url || typeof url !== 'string') {
    console.log('No URL provided or URL is not a string');
    return c.json({ error: "no_url_provided", message: "No URL was provided" }, 400);
  }
  
  // Check if URL looks like a Google Docs URL
  if (!url.includes('docs.google.com') && !url.includes('drive.google.com')) {
    console.log(`URL does not appear to be a Google Docs URL: ${url}`);
    return c.json({ 
      error: "not_google_docs_url", 
      message: "This doesn't appear to be a Google Docs URL",
      provided_url: url 
    }, 400);
  }
  
  // Extract document ID from various Google Docs URL formats
  const patterns = [
    /document\/d\/([a-zA-Z0-9_-]+)/,  // Standard docs URL
    /file\/d\/([a-zA-Z0-9_-]+)/,     // Drive URL
    /id=([a-zA-Z0-9_-]+)/            // Query parameter format
  ];
  
  let id = null;
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match) {
      id = match[1];
      break;
    }
  }
  
  if (!id) {
    console.log(`Could not extract document ID from URL: ${url}`);
    return c.json({ 
      error: "invalid_google_docs_url", 
      message: "Could not extract document ID from Google Docs URL",
      provided_url: url 
    }, 400);
  }
  
  console.log(`Extracted document ID: ${id}`);
  
  try {
    const exportUrl = `https://docs.google.com/document/d/${id}/export?format=html`;
    console.log(`Fetching from: ${exportUrl}`);
    
    const r = await fetch(exportUrl);
    if (!r.ok) {
      console.log(`Google Docs export failed with status: ${r.status}`);
      return c.json({ 
        error: "fetch_failed", 
        message: `Google Docs export failed with status ${r.status}`,
        status: r.status 
      }, r.status);
    }
    
    const html = await r.text();
    console.log(`Successfully fetched document, HTML length: ${html.length}`);
    return c.json({ html });
    
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    return c.json({ 
      error: "fetch_error", 
      message: "Network error while fetching document",
      details: error.message 
    }, 500);
  }
});
// ---------- Intent (JSON function-calling) ----------
app.post("/make-server-e08b724b/intent", async (c) => {
  if (!GEMINI) return c.json({ error: "GEMINI_API_KEY missing" }, 500);
  const { q = "", history = [] } = await c.req.json().catch(() => ({}));

  const sys = `You are an intent router for a church "MC Hub".
Return STRICT JSON with this schema, no prose:
{
  "action": "talk" | "call",
  "message": string,
  "calls": [
    {
      "name": "search",
      "args": {
        "query": string,
        "role": "coach"|"leader"|"apprentice"|"member"|null,
        "apply": boolean,
        "section": "forms"|"documents"|"media"|null,
        "broad": boolean,
        "exact": boolean
      }
    }
  ]
}
Rules:
- Use action:"call" with a single search call whenever the user is looking for something (forms, applications, guides, docs, videos, where to find/get/show…).
- Set exact=true for asks like "MC Adjustment Form", "Coach Application", quoted titles, or short name+kind.
- If the user is just greeting or unclear, use action:"talk" and a short friendly "message".`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${sys}\n\nUser: ${q}` }]}],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      })
    }
  );

  const data = await res.json().catch(() => ({}));
  const text = data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text).join("") ?? "";
  try {
    const j = JSON.parse(text);
    j.action = j.action === "call" ? "call" : "talk";
    j.message = typeof j.message === "string" ? j.message : "";
    j.calls = Array.isArray(j.calls) ? j.calls.filter((x:any)=>x?.name==="search") : [];
    return c.json(j);
  } catch {
    return c.json({ action: "talk", message: "Got it. Tell me the role or topic and I’ll pull the right forms, trainings, or guides.", calls: [] });
  }
});
// ---------- Google Calendar Events ----------
app.get("/make-server-e08b724b/calendar-events", async (c) => {
  const GCAL_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  const GCAL_ID = Deno.env.get("GOOGLE_CALENDAR_ID");

  if (!GCAL_KEY || !GCAL_ID) {
    console.log("Google Calendar API credentials not configured");
    return c.json({ error: "Google Calendar not configured", events: [] }, 500);
  }

  try {
    // Get events from 3 months ago to 12 months ahead
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
    const timeMax = new Date(now.getFullYear() + 1, now.getMonth() + 1, 0).toISOString();

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events`);
    url.searchParams.set("key", GCAL_KEY);
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "100");

    console.log(`Fetching Google Calendar events from ${timeMin} to ${timeMax}`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Calendar API error: ${response.status} - ${errorText}`);
      return c.json({ error: "Failed to fetch calendar events", details: errorText }, response.status);
    }

    const data = await response.json();
    const events = data.items || [];

    // Transform Google Calendar events to DateItem format
    const dateItems = events.map((event: any) => {
      const startDate = event.start?.dateTime || event.start?.date;
      const endDate = event.end?.dateTime || event.end?.date;
      const eventDate = new Date(startDate);
      const title = event.summary || "Untitled Event";
      const titleLower = title.toLowerCase();

      // Determine semester based on month
      const month = eventDate.getMonth();
      let semester: "fall" | "winter" | "spring";
      if (month >= 7 && month <= 11) {
        semester = "fall"; // Aug-Dec
      } else if (month >= 0 && month <= 2) {
        semester = "winter"; // Jan-Mar
      } else {
        semester = "spring"; // Apr-Jul
      }

      // Format date display (e.g., "August 13")
      const dateDisplay = eventDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });

      // Build description from time or event description
      let description = "";
      if (event.start?.dateTime) {
        const startTime = new Date(event.start.dateTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        if (event.end?.dateTime) {
          const endTime = new Date(event.end.dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          description = `${startTime} - ${endTime}`;
        } else {
          description = startTime;
        }
      } else if (event.description) {
        description = event.description.substring(0, 100);
      }

      return {
        id: event.id,
        date: dateDisplay,
        title: title,
        description: description,
        semester: semester,
        year: eventDate.getFullYear(),
        isDeadline: titleLower.includes("deadline"),
        isTraining: titleLower.includes("training"),
        isExpo: titleLower.includes("expo"),
      };
    });

    console.log(`Transformed ${dateItems.length} calendar events`);
    return c.json(dateItems);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return c.json({ error: "Failed to fetch calendar events", message: error.message }, 500);
  }
});

// ---------- Direct Gemini smoke test ----------
app.post("/make-server-e08b724b/test-gemini", async (c) => {
  if (!GEMINI) return c.json({ error: "GEMINI_API_KEY missing" }, 500);
  const { prompt = "Say 'MC Hub ready'." } = await c.req.json().catch(() => ({}));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }]}] }),
    }
  );
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text).join("") ?? "";
  return new Response(JSON.stringify({ ok: res.ok, model: "gemini-1.5-pro", text, raw: data }), {
    status: res.status,
    headers: { "content-type":"application/json", "access-control-allow-origin":"*" }
  });
});

Deno.serve(app.fetch);