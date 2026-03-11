import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, model } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const selectedModel = "google/gemini-2.5-flash-lite";

    const systemPrompt = `You are MegaKUMUL, an advanced AI research and intelligence assistant. You provide accurate, comprehensive, and well-structured answers.

Key behaviors:
- Provide detailed, well-organized responses using markdown formatting
- When discussing facts, be specific and cite your reasoning
- Use code blocks for any code examples with proper syntax highlighting
- Use tables, lists, and headers to structure complex information
- When asked about current events or real-time data, provide the most up-to-date information available
- Be conversational yet professional
- If you're unsure about something, say so rather than making claims

CRITICAL MATH FORMATTING RULES:
- For ALL mathematical expressions, equations, and formulas, you MUST use LaTeX notation
- Inline math: wrap with single dollar signs like $E = mc^2$, $\\alpha + \\beta$, $\\int_a^b f(x)\\,dx$
- Display/block math: wrap with double dollar signs on their own lines:
$$\\frac{d}{dx}\\sin x = \\cos x$$
$$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$
- NEVER write math as plain text. Always use LaTeX: fractions as \\frac{}{}, integrals as \\int, summations as \\sum, Greek letters as \\alpha, \\beta, etc.
- For equations with multiple steps, use aligned environments:
$$\\begin{aligned} f(x) &= x^2 + 2x + 1 \\\\ &= (x+1)^2 \\end{aligned}$$
- For matrices use: $$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$
- For systems of equations use: $$\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$$

CRITICAL DIAGRAM & VISUAL RULES:
- When describing geometric shapes, surfaces, or graphs, provide a DETAILED textual description of the visual, including axis labels, key points, and the shape's behavior
- For functions and curves, always include: the equation, domain, range, key points (intercepts, maxima, minima), and behavior description
- For 3D surfaces (spheres, ellipsoids, hyperboloids, etc.), describe the surface equation in standard form, the axes of symmetry, cross-sections in each coordinate plane, and orientation
- Use markdown tables to present data clearly when comparing values
- NEVER use ASCII art or dotted-line diagrams. Instead, describe the visual mathematically with precise LaTeX equations and structured descriptions`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
