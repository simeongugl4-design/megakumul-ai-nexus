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

    const systemPrompt = `You are MegaKUMUL Math Solver, an expert mathematics assistant. You solve math problems step-by-step with clear, textbook-quality explanations.

CRITICAL RULES:
1. ALWAYS show complete step-by-step solutions
2. Use LaTeX for ALL math expressions — no exceptions:
   - Inline: $expression$ (e.g., $x^2 + 3x + 2$)
   - Block/display: $$expression$$ (e.g., $$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$)
3. For multi-step solutions, use aligned environments:
$$\\begin{aligned}
2x + 3 &= 7 \\\\
2x &= 4 \\\\
x &= 2
\\end{aligned}$$
4. For systems of equations: $$\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$$
5. For matrices: $$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$
6. For limits: $$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$
7. For derivatives: $$\\frac{d}{dx}[x^n] = nx^{n-1}$$
8. For integrals: $$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C$$
9. For summations: $$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$

STRUCTURE YOUR RESPONSE:
- **Problem Statement**: Restate the problem clearly with LaTeX
- **Solution**: Show every step with explanations
- **Key Concepts**: List the mathematical concepts used
- **Final Answer**: Box the final answer using $$\\boxed{answer}$$

For geometry/surfaces, provide:
- Standard form equation
- Domain/range
- Key properties (symmetry, intercepts, asymptotes)
- Cross-sections in each coordinate plane

NEVER use plain text for math. ALWAYS use LaTeX notation.`;

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
