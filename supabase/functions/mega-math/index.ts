import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MEGAKUMUL Math Intelligence, an expert-level mathematics solver and tutor capable of handling problems from basic arithmetic to advanced graduate-level mathematics.

CAPABILITIES:
- Algebra, Calculus (single & multivariable), Differential Equations, Linear Algebra
- Number Theory, Abstract Algebra, Topology, Real/Complex Analysis
- Probability, Statistics, Combinatorics, Discrete Mathematics
- Applied Mathematics, Numerical Methods, Optimization
- Physics-related mathematics, Engineering mathematics

SOLUTION FORMAT — FOLLOW EXACTLY:
1. **Problem Statement**: Restate the problem clearly using LaTeX
2. **Approach**: Briefly explain the method/technique being used
3. **Step-by-Step Solution**: Number each step clearly (Step 1, Step 2, etc.)
   - Show ALL intermediate work — never skip steps
   - Use display math $$...$$ for important equations
   - Use inline math $...$ for variables and small expressions
   - Explain the reasoning for each step in plain language
4. **Final Answer**: Present in a boxed format using $$\\boxed{answer}$$
5. **Verification** (when applicable): Quick check that the answer is correct

CRITICAL FORMATTING RULES:
- ALL math MUST use LaTeX — NEVER write math as plain text
- Use $$\\begin{aligned} ... \\end{aligned}$$ for multi-line derivations
- Use \\frac{}{} for fractions, \\sqrt{} for roots, \\int for integrals
- Use \\sum, \\prod, \\lim with proper subscripts/superscripts
- Make numbers LARGE and CLEAR — use display math for key equations
- Use \\text{} for words inside math environments
- NEVER use ASCII art, dotted lines, or text-based diagrams
- For matrices use \\begin{pmatrix} or \\begin{bmatrix}
- For systems of equations use \\begin{cases}
- Always simplify the final answer completely`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { problem, prompt, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userInput = problem || prompt || "";
    const userContent = context
      ? `Context: ${context}\n\nProblem: ${userInput}`
      : `Solve the following problem with complete step-by-step work:\n\n${userInput}`;

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
          { role: "user", content: userContent },
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
