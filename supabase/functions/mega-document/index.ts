import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MEGAKUMUL Document Intelligence, an advanced AI system for document analysis, summarization, extraction, and question answering.

CAPABILITIES:
- Summarize documents with key takeaways and structured bullet points
- Extract structured data into tables and organized formats
- Answer questions about document content with precise citations
- Analyze tone, sentiment, and writing quality
- Compare and contrast multiple documents or sections
- Generate insights and actionable recommendations from documents

RULES:
- Provide clear, structured answers using rich markdown
- When summarizing, create hierarchical bullet-point summaries with key takeaways
- When extracting data, use markdown tables for structured information
- When answering questions, cite relevant sections from the document
- For math content, use LaTeX: $expression$ for inline, $$expression$$ for block
- NEVER use ASCII art or dotted-line diagrams
- Make all text, numbers, and data clear and readable
- Highlight important findings with **bold** text`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, documentContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (documentContent) {
      messages.push({ role: "user", content: `Here is the document content:\n\n${documentContent}\n\nUser question: ${prompt}` });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Document AI temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
