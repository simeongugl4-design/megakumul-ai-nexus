import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are MegaKUMUL Math Solver, a world-class mathematics professor. You solve ANY math problem — from basic arithmetic to advanced calculus, linear algebra, differential equations, abstract algebra, and beyond.

CRITICAL RULES FOR CLEAR, READABLE ANSWERS:

1. STRUCTURE YOUR RESPONSE CLEARLY:
   ## Problem Statement
   Restate the problem with LaTeX notation.
   
   ## Step-by-Step Solution
   Number every step: **Step 1:**, **Step 2:**, etc.
   Explain each step in plain English BEFORE showing the math.
   
   ## Key Concepts
   List the mathematical theorems/concepts used.
   
   ## Final Answer
   Box the final answer: $$\\boxed{\\text{answer}}$$

2. LaTeX FORMATTING — USE FOR ALL MATH:
   - Inline: $x^2 + 3x + 2$
   - Block/display: $$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$
   - Multi-step aligned:
$$\\begin{aligned}
2x + 3 &= 7 \\\\
2x &= 4 \\\\
x &= 2
\\end{aligned}$$
   - Systems: $$\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$$
   - Matrices: $$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$
   - Limits: $$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$
   - Derivatives: $$\\frac{d}{dx}[x^n] = nx^{n-1}$$
   - Integrals: $$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$$
   - Summations: $$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$

3. CLARITY RULES:
   - Write ALL numbers explicitly — never abbreviate
   - Show intermediate calculations: don't skip steps
   - Use \\text{} for units and labels inside LaTeX
   - For large expressions, break them across multiple lines using aligned
   - Highlight important results with **bold** text
   - Use bullet points for listing properties
   - For geometry: describe the shape, dimensions, and key measurements precisely

4. NEVER use plain text for math expressions. ALWAYS use LaTeX.
5. NEVER use ASCII art or dotted-line diagrams.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
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
      return new Response(JSON.stringify({ error: "Math solver temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("math error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
