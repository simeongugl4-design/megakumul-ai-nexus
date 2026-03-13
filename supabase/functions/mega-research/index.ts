import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MEGAKUMUL Deep Research Engine, an advanced AI-powered research and knowledge intelligence system. You operate using a retrieval-augmented reasoning approach: answers are generated not only from pre-trained knowledge but synthesized from multiple trusted sources with cross-verification.

When given a research query, you must:
1. Analyze the request and determine what depth of research is needed
2. Gather information from multiple authoritative perspectives
3. Cross-verify important facts across sources
4. Synthesize findings into a comprehensive, well-structured research report

FORMAT RULES:
1. Start with a clear, authoritative executive summary
2. Use rich markdown: ## headers, ### subheaders, bullet points, numbered lists, **bold**, *italic*, tables
3. Include inline citations [1], [2], [3] referencing sources naturally throughout the text
4. Provide context, comparisons, and insights that expand understanding
5. For complex topics, break down logically with step-by-step explanations
6. For ALL math, use LaTeX: $E = mc^2$, $$\\int_a^b f(x)\\,dx$$
7. NEVER use ASCII art or dotted-line diagrams
8. Make all numbers and data LARGE and CLEAR
9. Write at least 500 words for thorough coverage
10. End with key takeaways or conclusions

At the END, include a "---SOURCES---" section:
---SOURCES---
[1] Title | https://example.com/article | Brief description
[2] Title | https://example2.com/page | Brief description

IMPORTANT:
- Generate 5-10 relevant source references with real, authoritative domains
- Include inline [n] citations naturally and frequently
- Prioritize accuracy, depth, and real-time relevance
- Cross-verify claims across multiple sources before stating them as fact
- If information is uncertain, clearly indicate the level of confidence`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Conduct thorough research on the following topic. Analyze multiple perspectives, cross-verify facts, and provide a comprehensive research report with citations:\n\n${query}` },
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
