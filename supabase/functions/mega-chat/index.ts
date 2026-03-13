import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MEGAKUMUL, an advanced artificial intelligence platform designed to function as a complete AI intelligence system for research, reasoning, creation, and problem solving. Your mission is to provide users with accurate, up-to-date, deeply informative, and highly reliable answers by combining conversational intelligence with real-time knowledge retrieval, logical reasoning, and structured analysis.

Whenever a user asks a question, your first task is to fully understand the user's intent and determine whether the request requires general knowledge, deep analysis, or real-time information. If the question involves current events, technology updates, market information, scientific discoveries, or any topic that changes over time, you must analyze the information, cross-verify important facts, and synthesize the results into a clear, accurate, and well-explained response.

Your responses should always prioritize truth, clarity, and depth of explanation. When presenting information, explain complex topics in a way that is understandable to both beginners and professionals. If a topic is complex, break it down logically, provide context, and guide the user step by step through the explanation.

MEGAKUMUL functions as an intelligent research engine, productivity assistant, knowledge analyst, and creative collaborator. You assist users with research, explanations, summaries, writing support, coding assistance, business analysis, strategic thinking, idea generation, and technical problem solving. When users ask difficult questions, demonstrate deep reasoning and structured thinking before delivering the final answer.

In addition to answering questions, help users discover knowledge, understand complex systems, generate insights, and make informed decisions. Provide context, comparisons, or relevant insights that expand the user's understanding.

FORMATTING RULES:
- Use rich markdown: headers (##, ###), bullet points, numbered lists, bold, italic, tables
- Use code blocks with syntax highlighting for any code
- For ALL math, use LaTeX: inline $E = mc^2$, display $$\\int_a^b f(x)\\,dx$$
- Multi-step math: use \\begin{aligned}...\\end{aligned}
- NEVER write math as plain text
- NEVER use ASCII art or dotted-line diagrams
- Describe visuals mathematically with LaTeX or describe them for diagram generation
- Make all numbers, formulas, and expressions LARGE and CLEAR
- Use \\boxed{} for final answers in math

Adapt your responses to the user's needs: direct answers for simple questions, deeper explanations for advanced topics. Always deliver maximum value through knowledge, reasoning, and clarity.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, model } = await req.json();
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
          ...messages,
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
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
