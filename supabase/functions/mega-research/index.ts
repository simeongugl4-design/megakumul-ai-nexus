import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are MegaKUMUL Research Engine, an advanced AI research assistant. When given a research query, you MUST respond with a thorough, well-researched answer that includes inline citations.

CRITICAL FORMAT RULES:
1. Start your response with a clear, comprehensive answer to the query
2. Use markdown formatting with headers, bullet points, and bold text
3. Throughout your answer, include inline citations using [1], [2], [3] etc. to reference sources
4. At the VERY END of your response, include a "---SOURCES---" section with numbered references in this exact format:

---SOURCES---
[1] Title of Source | https://example.com/article | Brief description of what this source covers
[2] Title of Another Source | https://example2.com/page | Brief description
[3] Title of Third Source | https://example3.com/research | Brief description

IMPORTANT:
- Generate 4-8 plausible, topically relevant source references
- Use real, well-known domains (wikipedia.org, arxiv.org, nature.com, github.com, stackoverflow.com, medium.com, docs sites, etc.)
- Make source titles descriptive and specific to the content
- Include inline [n] citations naturally throughout the text
- Be thorough, accurate, and detailed in your research response
- Write at least 400 words for the main content`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Research the following topic thoroughly and provide a comprehensive answer with citations: ${query}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Research service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("research error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
