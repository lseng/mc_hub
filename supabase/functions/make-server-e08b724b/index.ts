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
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

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

// /chat -> intent detection + RAG search with direct resource presentation
app.post("/make-server-e08b724b/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { q = "", role = "member" } = body;

  try {
    // Step 1: Call intent detection endpoint
    const baseUrl = `https://${SB_URL.replace('https://', '').split('/')[0]}/functions/v1/make-server-e08b724b/intent`;
    const intentRes = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": c.req.header("authorization") || `Bearer ${SB_ANON}`
      },
      body: JSON.stringify({ q, history: [] })
    });

    if (!intentRes.ok) {
      const errorText = await intentRes.text();
      console.error(`Intent detection failed: ${intentRes.status} - ${errorText}`);
      return c.json({
        text: "I'm having trouble understanding your request right now. Please try again.",
        resources: []
      });
    }

    const intent = await intentRes.json();
    console.log("Intent detection result:", JSON.stringify(intent));

    // Step 2: If action is "call", execute the search
    if (intent.action === "call" && Array.isArray(intent.calls) && intent.calls.length > 0) {
      const searchCall = intent.calls[0];
      const searchArgs = searchCall.args || {};

      // Construct search payload
      const searchPayload = {
        query: searchArgs.query || q,
        role: searchArgs.role || role,
        section: searchArgs.section || null,
        apply: searchArgs.apply || false,
        broad: searchArgs.broad !== false, // default to true
        exact: searchArgs.exact || false,
        limit: 10
      };

      console.log("Executing search with payload:", JSON.stringify(searchPayload));

      // Query database directly for resources
      const url = new URL(`${REST}/resource`);
      url.searchParams.set("select", "id,title,type,section,url,description,date_added,roles,tags,thumbnail_url");

      // Filter by section if provided
      if (searchPayload.section) {
        url.searchParams.set("section", `eq.${searchPayload.section}`);
      }

      // Filter by role if provided and not broad search
      if (searchPayload.role && !searchPayload.broad) {
        url.searchParams.set("roles", `cs.{${searchPayload.role}}`);
      }

      // Combine is_published filter with text search
      if (searchPayload.query) {
        url.searchParams.set("and", `(or.(is_published.eq.true,is_published.is.null),or.(title.ilike.*${searchPayload.query}*,description.ilike.*${searchPayload.query}*,tags.cs.{${searchPayload.query}}))`);
      } else {
        url.searchParams.set("or", "(is_published.eq.true,is_published.is.null)");
      }

      url.searchParams.set("limit", `${searchPayload.limit || 10}`);
      url.searchParams.set("order", "date_added.desc");

      const searchRes = await fetch(url, {
        headers: {
          apikey: SB_ANON,
          Authorization: `Bearer ${SB_ANON}`
        }
      });

      if (!searchRes.ok) {
        console.error(`Database query failed: ${searchRes.status}`);
        return c.json({
          text: "I couldn't complete the search. Please try again.",
          resources: []
        });
      }

      const resources = await searchRes.json();
      console.log("Search result:", JSON.stringify(resources));

      // Step 3: Generate a helpful AI message using Claude
      let aiMessage = "";
      if (resources.length > 0) {
        // Create a summary of the resources using Claude
        try {
          const summarizeRes = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
              },
              body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 512,
                temperature: 0.3,
                messages: [{
                  role: "user",
                  content: `User asked: "${q}"

I found ${resources.length} resource(s):
${resources.slice(0, 5).map((r: any) => `- ${r.title} (${r.type}): ${r.description || 'No description'}`).join('\n')}

Write a brief, friendly 1-2 sentence message explaining what resources were found. Be specific about what types of resources and how they relate to the user's query. Don't say "I found" - just describe what's available.`
                }]
              })
            }
          );

          if (summarizeRes.ok) {
            const summarizeData = await summarizeRes.json();
            aiMessage = summarizeData?.content?.[0]?.text ?? "";
          }
        } catch (err) {
          console.error("Failed to generate AI summary:", err);
        }

        // Fallback message if AI generation fails
        if (!aiMessage) {
          const resourceTypes = [...new Set(resources.map((r: any) => r.type))];
          aiMessage = `Here are ${resources.length} resource${resources.length > 1 ? 's' : ''} I found for you, including ${resourceTypes.slice(0, 2).join(' and ')}.`;
        }
      } else {
        aiMessage = "I couldn't find any resources matching your query. Try rephrasing your question or ask me about available forms, documents, or training materials.";
      }

      return c.json({
        text: aiMessage,
        answer: aiMessage,
        resources: resources,
        mode: "direct" // Not offer_resources
      });

    } else {
      // Step 4: If action is "talk", return the message
      return c.json({
        text: intent.message || "Hello! I can help you find resources, forms, and training materials. What are you looking for?",
        answer: intent.message || "Hello! I can help you find resources, forms, and training materials. What are you looking for?",
        resources: [],
        mode: "talk"
      });
    }

  } catch (error) {
    console.error("Chat endpoint error:", error);
    return c.json({
      text: "I'm experiencing technical difficulties. Please try again.",
      resources: []
    }, 500);
  }
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
      }, 500);
    }
    
    const html = await r.text();
    console.log(`Successfully fetched document, HTML length: ${html.length}`);
    return c.json({ html });
    
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({
      error: "fetch_error",
      message: "Network error while fetching document",
      details: errorMessage
    }, 500);
  }
});
// ---------- Intent (JSON function-calling) using Claude API ----------
app.post("/make-server-e08b724b/intent", async (c) => {
  if (!ANTHROPIC_API_KEY) return c.json({ error: "ANTHROPIC_API_KEY missing" }, 500);
  const { q = "", history = [] } = await c.req.json().catch(() => ({}));

  const sys = `You are an intent router for a church "MC Hub" resource database.
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

Rules for intent detection:
- Use action:"call" with a search call whenever the user is looking for resources. This includes queries with these patterns:
  * "show me", "find", "where is", "what forms", "what resources", "resources for", "forms for", "training for", "guides for"
  * "I need", "looking for", "search for", "get me", "pull up", "display"
  * Role mentions: "coach", "leader", "apprentice", "member"
  * Section mentions: "forms", "documents", "media", "training", "guides", "videos", "materials"
  * Application-related: "application", "apply", "sign up"

- When action is "call", construct the search args:
  * query: extract the main search terms (e.g., "forms for leaders" → query: "forms", role: "leader")
  * role: extract from user query if mentioned ("coach", "leader", "apprentice", "member")
  * section: extract if mentioned ("forms", "documents", "media")
  * exact: true only for specific titled items like "MC Adjustment Form" or quoted titles
  * broad: true for general queries without specific constraints
  * apply: true if query mentions "application" or "apply"

- Use action:"talk" ONLY for:
  * Pure greetings: "hi", "hello", "hey", "good morning"
  * General questions without search intent: "what is MC Hub?", "how does this work?"
  * Completely unclear queries that need clarification

- Default to action:"call" when in doubt - it's better to search and return results than to ask clarifying questions.
- For action:"talk", provide a brief, friendly message.`;

  try {
    const res = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          temperature: 0.1,
          system: sys,
          messages: [{
            role: "user",
            content: `User query: ${q}\n\nReturn JSON intent classification.`
          }]
        })
      }
    );

    if (!res.ok) {
      console.error(`Claude API error: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error(`Error details: ${errorText}`);
      return c.json({
        error: "Claude API request failed",
        status: res.status,
        details: errorText
      }, 500);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";

    // Parse the JSON response
    const j = JSON.parse(text);

    // Normalize the response
    j.action = j.action === "call" ? "call" : "talk";
    j.message = typeof j.message === "string" ? j.message : "";
    j.calls = Array.isArray(j.calls) ? j.calls.filter((x:any)=>x?.name==="search") : [];

    return c.json(j);

  } catch (error) {
    console.error("Intent detection error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
    // Fallback: treat as a search query by default
    return c.json({
      action: "call",
      message: "I'll search for that.",
      calls: [{
        name: "search",
        args: {
          query: q,
          role: null,
          apply: false,
          section: null,
          broad: true,
          exact: false
        }
      }]
    });
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
      return c.json({ error: "Failed to fetch calendar events", details: errorText }, 500);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: "Failed to fetch calendar events", message: errorMessage }, 500);
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